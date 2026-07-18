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
  console.log("Amount:", amount);
  console.log("Description:", description);

  // Validação básica
  if (!userId || !orderId) {
    throw new Error("Dados financeiros inválidos.");
  }

  if (amount <= 0) {
    throw new Error("Valor financeiro inválido.");
  }

  const { error } = await admin.rpc(
    "process_financial_transaction",
    {
      p_user_id: userId,
      p_order_id: orderId,
      p_type: "sale",
      p_amount: amount,
      p_description: description,
    }
  );

  if (error) {
    console.error("====================================");
    console.error("FINANCIAL ERROR");
    console.error("====================================");
    console.error(error);

    throw new Error(
      "Erro ao processar transação financeira."
    );
  }

  console.log("Financeiro atualizado com sucesso.");
  console.log("====================================");

  return {
    success: true,
    message: "Transação financeira processada com sucesso.",
  };
}