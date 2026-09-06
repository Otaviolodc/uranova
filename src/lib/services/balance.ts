import { admin } from "@/lib/supabase/admin";

export async function getUserFinancialSummary(userId: string) {
  const { data, error } = await admin
    .from("payments")
    .select(`
      value,
      final_value,
      platform_fee,
      stripe_fee,
      status,
      created_at
    `)
    .eq("user_id", userId)
    .eq("status", "PAID");

  if (error) {
    throw new Error(error.message);
  }

  const payments = data ?? [];

  const totalGross = payments.reduce(
    (total, payment) =>
      total + Number(payment.value ?? 0),
    0
  );

  const totalEarned = payments.reduce(
    (total, payment) =>
      total + Number(payment.final_value ?? 0),
    0
  );

  const totalPlatformFee = payments.reduce(
    (total, payment) =>
      total + Number(payment.platform_fee ?? 0),
    0
  );

  const totalStripeFee = payments.reduce(
    (total, payment) =>
      total + Number(payment.stripe_fee ?? 0),
    0
  );

  return {
    total_net: totalEarned,

    total_gross: totalGross,
    total_platform_fee: totalPlatformFee,
    total_stripe_fee: totalStripeFee,
  };
}