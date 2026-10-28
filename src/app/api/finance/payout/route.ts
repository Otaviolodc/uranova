import { integrationUnavailable } from "@/lib/security/staging-policy";
import { rateLimit } from "@/lib/security/rate-limit";
import { sameOrigin,jsonBody,reauthenticate,safeError } from "@/lib/security/request";
import { exactKeys,uuid,text } from "@/lib/security/validation";
import { requireFinanceUser } from "@/lib/finance/access";
import { priceToCents } from "@/lib/finance/money";
import { requestProducerPayout } from "@/lib/services/payouts";

export async function POST(req: Request) {
  const unavailable = integrationUnavailable(); if (unavailable) return unavailable;

  try {
    sameOrigin(req);
    const user = await requireFinanceUser(); await rateLimit("payout", user.id);
    const body = await jsonBody(req); exactKeys(body,["amount","requestKey","currentPassword"]);
    uuid(body.requestKey); text(body.amount,32);
    await reauthenticate(user,body.currentPassword);
    if (typeof body.amount !== "string" || typeof body.requestKey !== "string") {
      return Response.json({ error: "Valor ou identificador inválido." }, { status: 400 });
    }
    const amount = priceToCents(body.amount.replace(",", "."));
    const result = await requestProducerPayout(user.id, body.requestKey, amount);
    return Response.json({ id: result.id, status: result.status });
  } catch (error) {
    return safeError(error);
  }
}
