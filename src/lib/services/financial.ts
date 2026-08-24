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

  if (!userId || !orderId) {
    throw new Error("Dados financeiros inválidos.");
  }

  if (amount <= 0) {
    throw new Error("Valor financeiro inválido.");
  }

  // ======================================================
  // 1. PROCESSA A TRANSAÇÃO FINANCEIRA
  // ======================================================

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

  // ======================================================
  // 2. CRIA O PRAZO DE LIBERAÇÃO
  // ======================================================

  const availableAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  const { error: releaseError } = await admin
    .from("balance_releases")
    .upsert(
      {
        user_id: userId,
        order_id: orderId,
        amount,
        available_at: availableAt.toISOString(),
        status: "pending",
      },
      {
        onConflict: "order_id",
        ignoreDuplicates: true,
      }
    );

  if (releaseError) {
    console.error("====================================");
    console.error("BALANCE RELEASE ERROR");
    console.error("====================================");
    console.error(releaseError);

    throw new Error(
      "Erro ao criar prazo de liberação do saldo."
    );
  }

  console.log(
    "Saldo pendente programado para liberação:"
  );

  console.log(
    "Disponível em:",
    availableAt.toISOString()
  );

  console.log("====================================");

  return {
    success: true,
    message:
      "Transação financeira processada e saldo programado para liberação em 7 dias.",
  };
}

// ======================================================
// HISTÓRICO FINANCEIRO
// ======================================================

export async function getFinancialHistory(userId: string) {
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