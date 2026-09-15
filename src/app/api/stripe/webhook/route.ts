import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, assertStripeLive } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";
import { processCheckoutCompleted, processPaymentIntentSettlement } from "@/lib/services/payment-processor";
import { recordPayout, sellerForAccount, syncProducerFinance } from "@/lib/services/payouts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature) return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  if (!secret) return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }
  if (!event.livemode) return NextResponse.json({ received: true, ignored: "test_mode" });
  const token = randomUUID();
  try {
    assertStripeLive();
    const { data: claim, error } = await admin.rpc("claim_stripe_event", {
      p_id: event.id, p_type: event.type, p_account: event.account ?? null, p_token: token,
    });
    if (error) throw new Error(error.message);
    if (claim === "processed") return NextResponse.json({ received: true, duplicate: true });
    if (claim !== "claimed") return NextResponse.json({ error: "Evento em processamento." }, { status: 409 });
    const accountId = event.account;
    if (accountId) {
      const seller = await sellerForAccount(accountId);
      if (seller) {
        switch (event.type) {
          case "checkout.session.completed":
          case "checkout.session.async_payment_succeeded": {
            const session = event.data.object;
            if (session.metadata?.product_id) await processCheckoutCompleted({ session, stripeAccountId: accountId });
            break;
          }
          case "payment_intent.succeeded":
            await processPaymentIntentSettlement(event.data.object.id, accountId);
            break;
          case "charge.succeeded":
          case "charge.updated": {
            const charge = event.data.object;
            const id = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
            if (id && charge.paid && !charge.amount_refunded && !charge.disputed) await processPaymentIntentSettlement(id, accountId);
            break;
          }
          case "payout.created":
          case "payout.updated":
          case "payout.paid":
          case "payout.failed":
          case "payout.canceled": {
            const started = new Date().toISOString();
            const payout = await stripe.payouts.retrieve(event.data.object.id, {}, { stripeAccount: accountId });
            await recordPayout(seller.id, accountId, payout, started);
            break;
          }
        }
        if (["checkout.session.completed","checkout.session.async_payment_succeeded","payment_intent.succeeded",
          "charge.succeeded","charge.updated","charge.refunded","charge.dispute.created","charge.dispute.closed",
          "balance.available","payout.created","payout.updated","payout.paid","payout.failed","payout.canceled"].includes(event.type)) {
          await syncProducerFinance(seller.id, accountId);
        }
      }
    }
    const { error: finishError } = await admin.rpc("finish_stripe_event", { p_id: event.id, p_token: token, p_error: null });
    if (finishError) throw new Error(finishError.message);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown processing failure";
    console.error("Stripe webhook failed", { eventId: event.id, type: event.type, message });
    await admin.rpc("finish_stripe_event", { p_id: event.id, p_token: token, p_error: message });
    return NextResponse.json({ error: "Processamento pendente; tente novamente." }, { status: 500 });
  }
}
