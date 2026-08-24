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

/* ===========================
   RECUSAR SAQUE
=========================== */

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

/* ===========================
   MARCAR SAQUE COMO PAGO
=========================== */

export async function markWithdrawAsPaid(id: string) {
  console.log("====================================");
  console.log("PROCESSANDO SAQUE");
  console.log("====================================");
  console.log("Withdrawal ID:", id);

  if (!id) {
    throw new Error("ID do saque não informado.");
  }

  // ======================================================
  // PROCESSAMENTO FINANCEIRO CENTRALIZADO NO BANCO
  // ======================================================

  const { error } = await admin.rpc("process_withdrawal", {
    p_withdraw_id: id,
  });

  if (error) {
    console.error("====================================");
    console.error("WITHDRAWAL ERROR");
    console.error("====================================");
    console.error(error);

    throw new Error(
      error.message || "Erro ao processar saque."
    );
  }

  console.log("Saque processado com sucesso.");
  console.log("Withdrawal ID:", id);
  console.log("====================================");

  return {
    success: true,
    message: "Saque processado e marcado como pago com sucesso.",
  };
}