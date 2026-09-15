import "server-only";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { admin } from "@/lib/supabase/admin";
import { stripe, assertStripeLive } from "@/lib/stripe";
import { cents } from "@/lib/finance/money";
import { assertDirectChargeAccount } from "./payment-processor";

export async function sellerForAccount(accountId: string) {
  const { data, error } = await admin.from("profiles").select("id,stripe_account_id")
    .eq("stripe_account_id", accountId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function recordPayout(userId: string, accountId: string, payout: Stripe.Payout, started: string) {
  if (!payout.livemode || payout.currency !== "brl") throw new Error("Invalid Live BRL payout");
  const { error } = await admin.rpc("record_stripe_payout", {
    p_user: userId, p_account: accountId, p_started: started,
    p: { id: payout.id, livemode: payout.livemode, currency: payout.currency, amount: payout.amount,
      status: payout.status, metadata: payout.metadata, arrival_date: payout.arrival_date,
      failure_code: payout.failure_code, automatic: payout.automatic },
  });
  if (error) throw new Error(error.message);
}

/** Reconcile external payouts too: automatic Stripe payouts must never be paid again locally. */
export async function syncProducerFinance(userId: string, accountId: string) {
  assertStripeLive();
  const started = new Date().toISOString();
  const token = randomUUID();
  const { data: claimed, error: claimError } = await admin.rpc("claim_finance_sync", { p_user: userId, p_token: token });
  if (claimError || !claimed) throw new Error("Conciliação em andamento; tente novamente.");
  const options = { stripeAccount: accountId };
  for await (const payout of stripe.payouts.list({ limit: 100 }, options)) {
    if (payout.currency === "brl") await recordPayout(userId, accountId, payout, started);
  }
  // Refunds/disputes freeze local withdrawals until reviewed; never silently increase funds.
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await admin.from("payments").select("id,stripe_charge_id")
      .eq("user_id", userId).eq("finance_verified", true).order("id").range(offset, offset + 499);
    if (error) throw new Error(error.message);
    for (const payment of data ?? []) {
      const charge = await stripe.charges.retrieve(payment.stripe_charge_id, {}, options);
      if (!charge.livemode || charge.amount_refunded > 0 || charge.disputed) {
        const { error: updateError } = await admin.from("payments").update({ reconciliation_required: true }).eq("id", payment.id);
        if (updateError) throw new Error(updateError.message);
      }
    }
    if ((data?.length ?? 0) < 500) break;
  }
  const balance = await stripe.balance.retrieve({}, options);
  if (!balance.livemode) throw new Error("Live balance required");
  const available = balance.available.find((entry) => entry.currency === "brl")?.amount ?? 0;
  const pending = balance.pending.find((entry) => entry.currency === "brl")?.amount ?? 0;
  const { error } = await admin.rpc("complete_finance_sync", {
    p_user: userId, p_token: token, p_account: accountId, p_available: available, p_pending: pending, p_started: started,
  });
  if (error) throw new Error(error.message);
}

export async function requestProducerPayout(userId: string, requestKey: string, amount: number) {
  cents(amount);
  if (amount <= 0 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestKey)) {
    throw new Error("Invalid payout request");
  }
  const { data: profile, error } = await admin.from("profiles").select("stripe_account_id").eq("id", userId).single();
  if (error || !profile?.stripe_account_id) throw new Error("Connect account required");
  const accountId = profile.stripe_account_id as string;
  await assertDirectChargeAccount(accountId);
  const account = await stripe.accounts.retrieve(accountId);
  if (!account.payouts_enabled || account.settings?.payouts?.schedule?.interval !== "manual") {
    throw new Error("Saques desta conta são administrados pela Stripe. Use o painel Stripe ou configure o calendário manual antes de solicitar aqui.");
  }
  await syncProducerFinance(userId, accountId);
  const { data: withdrawal, error: reserveError } = await admin.rpc("reserve_stripe_payout", {
    p_user: userId, p_key: requestKey, p_amount: amount,
  });
  if (reserveError) throw new Error("Saldo insuficiente, solicitação em andamento ou conciliação pendente.");
  if (withdrawal.stripe_payout_id || withdrawal.status === "rejected") return withdrawal;
  // Stripe may prune keys after 24h. Never retry an ambiguous request beyond that window.
  if (Date.now() - new Date(withdrawal.requested_at).getTime() > 23 * 60 * 60 * 1000) {
    throw new Error("Saque aguardando conciliação. Não será reenviado automaticamente.");
  }
  const started = new Date().toISOString();
  // On timeout/error keep the reservation; releasing it could double-pay a successful payout.
  const payout = await stripe.payouts.create({ amount, currency: "brl", method: "standard",
    metadata: { uranova_withdrawal_id: withdrawal.id } },
  { stripeAccount: accountId, idempotencyKey: "uranova-payout-" + withdrawal.id });
  await recordPayout(userId, accountId, payout, started);
  await syncProducerFinance(userId, accountId);
  return { id: withdrawal.id, status: payout.status, stripe_payout_id: payout.id };
}
