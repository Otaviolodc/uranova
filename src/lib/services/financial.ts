import { admin } from "@/lib/supabase/admin";

interface ProcessSaleParams {
  userId: string;
  orderId: string;
  amount: number;
  description: string;
}

interface FinancialResult {
  success: boolean;
  message: string;
}

/**
 * Legacy compatibility shim.
 * Financial settlements are created exclusively by the Stripe
 * payment processor in `payments`.
 */
export async function processSale({
  userId,
  orderId,
  amount,
  description,
}: ProcessSaleParams): Promise<FinancialResult> {
  console.warn(
    "processSale is deprecated and no longer writes financial_transactions.",
    { userId, orderId, amount, description }
  );

  return {
    success: false,
    message:
      "O fluxo financeiro antigo foi desativado. O pagamento deve ser processado pelo Stripe webhook.",
  };
}

/**
 * Histórico financeiro oficial da Uranova.
 * `payments` é a fonte de verdade para vendas liquidadas.
 */
export async function getFinancialHistory(userId: string) {
  const { data, error } = await admin
    .from("payments")
    .select(
      "id, status, created_at, original_value, value, final_value, platform_fee, stripe_fee, net_value"
    )
    .eq("user_id", userId)
    .eq("status", "PAID")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((payment) => ({
    id: payment.id,
    created_at: payment.created_at,
    type: "sale",
    description: "Venda aprovada",
    amount: Number(payment.final_value ?? 0),
    gross_amount: Number(payment.original_value ?? payment.value ?? 0),
    platform_fee: Number(payment.platform_fee ?? 0),
    stripe_fee: Number(payment.stripe_fee ?? 0),
    net_value: Number(payment.net_value ?? 0),
  }));
}
