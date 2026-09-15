import { requireFinanceUser } from "@/lib/finance/access";
import { admin } from "@/lib/supabase/admin";
export async function GET(req: Request) {
  try {
    const user = await requireFinanceUser();
    const period = new URL(req.url).searchParams.get("period") ?? "7d";
    if (!["7d","30d","90d","12m"].includes(period)) return Response.json({ error: "Período inválido" }, { status: 400 });
    const { data, error } = await admin.rpc("finance_chart", { p_user: user.id, p_period: period });
    if (error) throw new Error(error.message);
    return Response.json({ data }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: "Não foi possível consultar as vendas." },
      { status: error instanceof Error && error.message === "UNAUTHENTICATED" ? 401 : 503 });
  }
}
