import { integrationUnavailable } from "@/lib/security/staging-policy";
import { rateLimit } from "@/lib/security/rate-limit";
import { safeError, sameOrigin } from "@/lib/security/request";
import { requireFinanceUser } from "@/lib/finance/access";
import { admin } from "@/lib/supabase/admin";
import { syncProducerFinance } from "@/lib/services/payouts";

export async function POST(req:Request) {
  const unavailable = integrationUnavailable(); if (unavailable) return unavailable;

  try {
    sameOrigin(req);
    const user = await requireFinanceUser(); await rateLimit("sync", user.id);
    const { data, error } = await admin.from("profiles").select("stripe_account_id").eq("id", user.id).single();
    if (error || !data?.stripe_account_id) throw new Error("Connect required");
    await syncProducerFinance(user.id, data.stripe_account_id);
    return Response.json({ success: true });
  } catch (error) {
    return safeError(error);
  }
}
