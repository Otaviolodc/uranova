import { admin } from "@/lib/supabase/admin";

interface CreateWithdrawRequestParams {
  userId: string;
  amount: number;
  pixKey: string;
  pixKeyType: string;
}

export async function createWithdrawRequest({
  userId,
  amount,
  pixKey,
  pixKeyType,
}: CreateWithdrawRequestParams) {
  // Busca o saldo do produtor
  const { data: balance, error: balanceError } = await admin
    .from("balances")
    .select("available_balance")
    .eq("user_id", userId)
    .single();

  if (balanceError) {
    throw new Error("Saldo não encontrado.");
  }

  if (amount <= 0) {
    throw new Error("Informe um valor válido.");
  }

  if (amount > balance.available_balance) {
    throw new Error("Saldo insuficiente.");
  }

  const { error } = await admin
    .from("withdraw_requests")
    .insert({
      user_id: userId,
      amount,
      pix_key: pixKey,
      pix_key_type: pixKeyType,
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
  };
}

export async function getWithdrawHistory(userId: string) {
  const { data, error } = await admin
    .from("withdraw_requests")
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