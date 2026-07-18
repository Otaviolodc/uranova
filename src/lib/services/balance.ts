import { admin } from "@/lib/supabase/admin";

export async function getUserBalance(userId: string) {
  const { data, error } = await admin
    .from("balances")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}