import { requireFinanceUser } from "@/lib/finance/access";
import { admin } from "@/lib/supabase/admin";
import { syncProducerFinance } from "@/lib/services/payouts";

export async function POST() {
  try {
    const user = await requireFinanceUser();
    const { data, error } = await admin.from("profiles").select("stripe_account_id").eq("id", user.id).single();
    if (error || !data?.stripe_account_id) throw new Error("Connect required");
    await syncProducerFinance(user.id, data.stripe_account_id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Finance sync failed", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Não foi possível conciliar. Tente novamente ou contate o suporte." },
      { status: error instanceof Error && error.message === "UNAUTHENTICATED" ? 401 : 503 });
  }
}
