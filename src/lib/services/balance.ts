import "server-only";
import { getFinanceSummary } from "./finance-reader";
export async function getUserFinancialSummary(userId: string) {
  const s = await getFinanceSummary(userId);
  return { total_net: s.producer_net_cents / 100, total_gross: s.gross_cents / 100,
    total_platform_fee: s.platform_fee_cents / 100, total_stripe_fee: s.stripe_fee_cents / 100 };
}
