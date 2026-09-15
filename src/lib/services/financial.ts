import "server-only";
import { getFinancePayments } from "./finance-reader";
export async function getFinancialHistory(userId: string) {
  return (await getFinancePayments(userId)).map((p) => ({
    id: p.id, created_at: p.paid_at, type: "sale",
    description: p.reconciliation_required ? "Venda — conciliação necessária" : "Venda Stripe Live",
    amount: p.producer_net_cents / 100,
  }));
}
