import { requireFinanceUser } from "@/lib/finance/access";
import { priceToCents } from "@/lib/finance/money";
import { requestProducerPayout } from "@/lib/services/payouts";

export async function POST(req: Request) {
  try {
    const user = await requireFinanceUser();
    const body = await req.json();
    if (typeof body.amount !== "string" || typeof body.requestKey !== "string") {
      return Response.json({ error: "Valor ou identificador inválido." }, { status: 400 });
    }
    const amount = priceToCents(body.amount.replace(",", "."));
    const result = await requestProducerPayout(user.id, body.requestKey, amount);
    return Response.json({ id: result.id, status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao solicitar saque";
    console.error("Payout request failed", message);
    return Response.json({ error: message === "UNAUTHENTICATED" ? "Autenticação necessária." :
      "Saque não concluído. Verifique o saldo, a conciliação e o calendário de depósitos Stripe. Se a resposta foi incerta, consulte a mesma solicitação." },
    { status: message === "UNAUTHENTICATED" ? 401 : 409 });
  }
}
