import "server-only";
import { admin } from "@/lib/supabase/admin";
import { requireFinanceAdmin, requireFinanceOwner } from "@/lib/finance/access";

export interface FinanceSummary {
  gross_cents: number; platform_fee_cents: number; stripe_fee_cents: number;
  producer_net_cents: number; approved_sales: number; available_cents: number;
  pending_cents: number; withdrawn_cents: number; pending_payout_cents: number;
  unverified_payments: number; failed_events: number; pending_events: number;
  reconciliation_required: boolean;
}

export async function getFinanceSummary(userId?: string): Promise<FinanceSummary> {
  if (userId) await requireFinanceOwner(userId); else await requireFinanceAdmin();
  const { data, error } = await admin.rpc("finance_summary", { p_user: userId ?? null });
  if (error) throw new Error(error.message);
  for (const [key, value] of Object.entries(data)) {
    if (key.endsWith("_cents") && !Number.isSafeInteger(value)) throw new Error("Monetary aggregate exceeds safe range");
  }
  return data;
}

export async function getFinancePayments(userId?: string) {
  if (userId) await requireFinanceOwner(userId); else await requireFinanceAdmin();
  let query = admin.from("payments").select("id,order_id,paid_at,gross_cents,platform_fee_cents,stripe_fee_cents,producer_net_cents,reconciliation_required")
    .eq("finance_verified", true).order("paid_at", { ascending: false }).limit(100);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getFinancePayouts(userId: string) {
  await requireFinanceOwner(userId);
  const { data, error } = await admin.from("withdrawals").select("id,amount_cents,status,requested_at,stripe_payout_id")
    .eq("user_id", userId).not("amount_cents", "is", null).order("requested_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}
