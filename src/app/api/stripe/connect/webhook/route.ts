import { verifyStripeWebhook } from "@/lib/security/stripe-webhook";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, assertStripeLive } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";
import { processCheckoutCompleted, processPaymentIntentSettlement } from "@/lib/services/payment-processor";
import { recordPayout, sellerForAccount, syncProducerFinance } from "@/lib/services/payouts";

export const runtime = "nodejs";

const relevantEvents = new Set([
  "checkout.session.completed", "checkout.session.async_payment_succeeded", "payment_intent.succeeded",
  "charge.succeeded", "charge.updated", "charge.refunded", "charge.dispute.created", "charge.dispute.closed",
  "balance.available", "payout.created", "payout.updated", "payout.paid", "payout.failed", "payout.canceled",
]);

function ignored(event: Stripe.Event, reason: string) {
  // No payload, signature or credentials in logs. Ignored events never acquire a settlement lease.
  console.info("Stripe webhook outcome", { eventId: event.id, type: event.type, outcome: "ignored", reason });
  return NextResponse.json({ received: true, outcome: "ignored", reason });
}

function requireSettlement(result: { status: string }) {
  if (result.status !== "paid") throw new Error("RECOVERY_REQUIRED: checkout payment not settled");
}

export async function POST(req: Request) {
  const verified = await verifyStripeWebhook(req, "connect");
  if ("response" in verified) return verified.response;
  const event = verified.event;
  if (!event.livemode) return ignored(event, "test_mode");
  if (!relevantEvents.has(event.type)) return ignored(event, "unsupported_event");

  const token = randomUUID();
  let claimed = false;
  try {
    assertStripeLive();
    const { data: claim, error } = await admin.rpc("claim_stripe_event", {
      p_id: event.id, p_type: event.type, p_account: event.account ?? null, p_token: token,
    });
    if (error) throw new Error(error.message);
    if (claim === "processed") return NextResponse.json({ received: true, outcome: "processed", duplicate: true });
    if (claim !== "claimed") return NextResponse.json({ outcome: "pending_recovery", reason: "event_busy" }, { status: 409 });
    claimed = true;
    const accountId = event.account;
    if (accountId) {
      const seller = await sellerForAccount(accountId);
      if (!seller) throw new Error("Unknown Stripe seller; reconciliation required");
      if (seller) {
        switch (event.type) {
          case "checkout.session.completed":
          case "checkout.session.async_payment_succeeded": {
            const session = event.data.object;
            requireSettlement(await processCheckoutCompleted({ session, stripeAccountId: accountId }));
            break;
          }
          case "payment_intent.succeeded":
            requireSettlement(await processPaymentIntentSettlement(event.data.object.id, accountId));
            break;
          case "charge.succeeded":
          case "charge.updated": {
            const charge = event.data.object;
            const id = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
            if (charge.paid && !charge.amount_refunded && !charge.disputed) {
              if (!id) throw new Error("RECOVERY_REQUIRED: charge PaymentIntent missing");
              requireSettlement(await processPaymentIntentSettlement(id, accountId));
            } else if (event.type === "charge.succeeded") {
              await syncProducerFinance(seller.id, accountId);
              throw new Error("RECOVERY_REQUIRED: charge requires review");
            }
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
    return NextResponse.json({ received: true, outcome: "processed" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown processing failure";
    console.error("Stripe webhook outcome", { eventId: event.id, type: event.type, outcome: "pending_recovery" });
    if (claimed) {
      try {
        const { error: finishError } = await admin.rpc("finish_stripe_event", { p_id: event.id, p_token: token, p_error: message });
        if (finishError) throw finishError;
      } catch {
        console.error("Stripe webhook recovery status unavailable", { eventId: event.id });
      }
    }
    return NextResponse.json({ outcome: "pending_recovery", error: "Processamento pendente; tente novamente." }, { status: 500 });
  }
}
