import { admin } from "@/lib/supabase/admin";

export async function getWithdrawRequests() {
  // Busca os saques
  const { data: withdraws, error } = await admin
    .from("withdraw_requests")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // Não há saques
  if (!withdraws || withdraws.length === 0) {
    return [];
  }

  // Obtém todos os user_id únicos
  const userIds = [...new Set(withdraws.map((w) => w.user_id))];

  // Busca os perfis desses usuários
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, name, username, avatar_url")
    .in("id", userIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  // Junta saque + perfil
  return withdraws.map((withdraw) => ({
    ...withdraw,
    profile:
      profiles?.find((p) => p.id === withdraw.user_id) ?? null,
  }));
}

/* ===========================
   APROVAR SAQUE
=========================== */

export async function approveWithdraw(id: string) {
  const { error } = await admin
    .from("withdraw_requests")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function rejectWithdraw(id: string) {
  const { error } = await admin
    .from("withdraw_requests")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markWithdrawAsPaid(id: string) {
  // Busca o saque
  const { data: withdraw, error: withdrawError } = await admin
    .from("withdraw_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (withdrawError || !withdraw) {
    throw new Error("Saque não encontrado.");
  }

  // O saque deve estar aprovado
  if (withdraw.status !== "approved") {
    switch (withdraw.status) {
      case "pending":
        throw new Error("O saque ainda não foi aprovado.");

      case "rejected":
        throw new Error("Este saque foi recusado.");

      case "paid":
        throw new Error("Este saque já foi pago.");

      default:
        throw new Error("Status do saque inválido.");
    }
  }

  // O valor precisa ser maior que zero
  if (Number(withdraw.amount) <= 0) {
    throw new Error("Valor do saque inválido.");
  }

  // Busca o saldo do produtor
  const { data: balance, error: balanceError } = await admin
    .from("balances")
    .select("*")
    .eq("user_id", withdraw.user_id)
    .single();

  if (balanceError || !balance) {
    throw new Error("Saldo do produtor não encontrado.");
  }

  // Confere saldo disponível
  if (Number(balance.available_balance) < Number(withdraw.amount)) {
    throw new Error("Saldo insuficiente para concluir este pagamento.");
  }

// ==========================
// ETAPA 2 - Inserir financial_transactions
// ==========================

const { error: transactionError } = await admin
  .from("financial_transactions")
  .insert({
    user_id: withdraw.user_id,
    withdrawal_id: withdraw.id,
    type: "withdrawal",
    amount: withdraw.amount,
    description: "Saque realizado via PIX",
  });

if (transactionError) {
  console.error(
    "Erro ao inserir financial_transactions:",
    transactionError
  );
  throw transactionError;
}

// ==========================
// ETAPA 3 - Atualizar withdraw_requests
// ==========================

const { error: updateWithdrawError } = await admin
  .from("withdraw_requests")
  .update({
    status: "paid",
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  .eq("id", withdraw.id);

if (updateWithdrawError) {
  console.error(
    "Erro ao atualizar withdraw_requests:",
    updateWithdrawError
  );
  throw updateWithdrawError;
}

  // ==========================
  // ETAPA 4 - Atualizar balances
  // ==========================

const { error: updateBalanceError } = await admin
  .from("balances")
  .update({
    available_balance:
      Number(balance.available_balance) - Number(withdraw.amount),

    total_withdrawn:
      Number(balance.total_withdrawn) + Number(withdraw.amount),

    updated_at: new Date().toISOString(),
  })
  .eq("user_id", withdraw.user_id);

if (updateBalanceError) {
  console.error("Erro ao atualizar balances:", updateBalanceError);
  throw updateBalanceError;
}

}