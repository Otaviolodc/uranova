import "server-only";
import { stripe, assertStripeLive } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";
import type Stripe from "stripe";
import { directChargeAmounts } from "@/lib/finance/money";

export async function assertDirectChargeAccount(accountId: string) {
  assertStripeLive();
  const account = await stripe.v2.core.accounts.retrieve(accountId, { include: ["defaults"] });
  if (account.defaults?.responsibilities?.fees_collector !== "stripe") {
    throw new Error("Conta Connect incompatível: taxas precisam ser cobradas do produtor.");
  }
}

/** Stripe validation precedes one atomic database write. Errors reach the webhook. */
export async function processCheckoutCompleted({ session: incoming, stripeAccountId }: {
  session: Stripe.Checkout.Session; stripeAccountId: string;
}) {
  assertStripeLive();
  if (!stripeAccountId || !incoming.livemode) throw new Error("Live Connect event required");
  const options = { stripeAccount: stripeAccountId };
  const session = await stripe.checkout.sessions.retrieve(incoming.id, {}, options);
  if (!session.livemode || session.mode !== "payment") throw new Error("Invalid Live checkout");
  if (session.payment_status !== "paid") return { status: "pending" };
  const { product_id: checkoutId, seller_id: sellerId, customer_id: customerId } = session.metadata ?? {};
  if (!checkoutId || !sellerId || !customerId) throw new Error("Missing Uranova checkout metadata");
  const { data: product, error: productError } = await admin.from("products_checkout")
    .select("id, user_id, product_id").eq("id", checkoutId).single();
  if (productError || !product?.product_id || product.user_id !== sellerId) throw new Error("Invalid product or seller");
  const { data: profile, error: profileError } = await admin.from("profiles")
    .select("stripe_account_id").eq("id", sellerId).single();
  if (profileError || profile?.stripe_account_id !== stripeAccountId) throw new Error("Connect account mismatch");
  await assertDirectChargeAccount(stripeAccountId);
  const intentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!intentId) throw new Error("PaymentIntent missing");
  const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ["latest_charge.balance_transaction"] }, options);
  if (!intent.livemode || intent.status !== "succeeded" || intent.currency !== "brl" ||
      intent.amount_received !== session.amount_total) throw new Error("Payment not confirmed or amount mismatch");
  if (!intent.latest_charge) throw new Error("Charge not available yet");
  const charge = typeof intent.latest_charge === "string"
    ? await stripe.charges.retrieve(intent.latest_charge, { expand: ["balance_transaction"] }, options)
    : intent.latest_charge;
  if (!charge.livemode || !charge.paid || !charge.captured || charge.status !== "succeeded" ||
      charge.currency !== "brl" || charge.amount !== intent.amount_received || charge.refunded ||
      charge.amount_refunded > 0 || charge.disputed) throw new Error("Charge requires reconciliation");
  const transaction = typeof charge.balance_transaction === "string"
    ? await stripe.balanceTransactions.retrieve(charge.balance_transaction, {}, options)
    : charge.balance_transaction;
  if (!transaction) throw new Error("Balance transaction not available yet; retry");
  const amounts = directChargeAmounts(intent.amount_received, charge.application_fee_amount ?? 0, transaction);
  const { data, error } = await admin.rpc("settle_stripe_sale", { p: {
    account_id: stripeAccountId, session_id: session.id, intent_id: intent.id,
    charge_id: charge.id, transaction_id: transaction.id, checkout_id: checkoutId,
    seller_id: sellerId, customer_id: customerId, product_id: product.product_id,
    gross: amounts.gross, platform_fee: amounts.platformFee, stripe_fee: amounts.stripeFee,
    producer_net: amounts.producerNet, currency: "brl", livemode: true,
    available_on: new Date(transaction.available_on * 1000).toISOString(),
    paid_at: new Date(charge.created * 1000).toISOString(),
    customer_name: session.customer_details?.name ?? "Cliente Stripe",
    customer_email: session.customer_details?.email ?? "", fee_details: transaction.fee_details,
  } });
  if (error) throw new Error("Settlement failed: " + error.message);
  return { status: "paid", sellerId, data };
}

export async function processPaymentIntentSettlement(intentId: string, stripeAccountId: string) {
  assertStripeLive();
  const sessions = await stripe.checkout.sessions.list({ payment_intent: intentId, limit: 1 }, { stripeAccount: stripeAccountId });
  if (!sessions.data[0]?.metadata?.product_id) return { status: "ignored" };
  return processCheckoutCompleted({ session: sessions.data[0], stripeAccountId });
}
