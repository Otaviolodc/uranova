"use server";

import { createClient } from "@/lib/supabase/server";
import { createWithdrawRequest } from "@/lib/services/withdraw";

interface WithdrawRequestInput {
  amount: number;
  pixKey: string;
  pixKeyType: string;
}

export async function submitWithdrawRequest({
  amount,
  pixKey,
  pixKeyType,
}: WithdrawRequestInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  return createWithdrawRequest({
    userId: user.id,
    amount,
    pixKey,
    pixKeyType,
  });
}