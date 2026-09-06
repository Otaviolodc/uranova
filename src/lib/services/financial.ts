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
 * Registra a receita líquida do produtor.
 *
 * IMPORTANTE:
 * A comissão da Uranova NÃO é processada aqui.
 *
 * A comissão da Uranova é recebida diretamente pelo Stripe
 * através de application_fee_amount.
 *
 * Este serviço serve apenas para registrar no banco
 * o valor financeiro pertencente ao produtor.
 */
export async function processSale({
  userId,
  orderId,
  amount,
  description,
}: ProcessSaleParams): Promise<FinancialResult> {
  console.log("====================================");
  console.log("FINANCIAL SERVICE");
  console.log("====================================");

  console.log("User:", userId);
  console.log("Order:", orderId);
  console.log("Producer amount:", amount);
  console.log("Description:", description);

  if (!userId || !orderId) {
    throw new Error("Dados financeiros inválidos.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Valor financeiro inválido.");
  }

  /**
   * ==========================================================
   * NOVO FLUXO
   * ==========================================================
   *
   * NÃO usamos mais:
   *
   * - process_financial_transaction
   * - RPC financeira antiga
   * - cálculo da comissão Uranova
   *
   * O Stripe já processou:
   *
   * Venda
   * - 10% Uranova
   * - taxa Stripe
   * = valor destinado ao produtor
   *
   * Aqui apenas registramos o valor do produtor.
   */

  const { error } = await admin
    .from("financial_transactions")
    .insert({
      user_id: userId,
      order_id: orderId,
      type: "sale",
      amount,
      description,
    });

  if (error) {
    console.error("====================================");
    console.error("FINANCIAL ERROR");
    console.error("====================================");
    console.error(error);

    throw new Error(
      "Erro ao registrar transação financeira."
    );
  }

  console.log(
    "Transação financeira registrada com sucesso."
  );

  console.log("====================================");

  return {
    success: true,
    message:
      "Transação financeira registrada com sucesso.",
  };
}

/**
 * ==========================================================
 * HISTÓRICO FINANCEIRO
 * ==========================================================
 */

export async function getFinancialHistory(
  userId: string
) {
  const { data, error } = await admin
    .from("financial_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}