import { requireFinanceUser } from "@/lib/finance/access";

// External pending checkouts cannot yet be disproved: no destructive fallback.
export async function POST() {
  try {
    await requireFinanceUser();
    return Response.json({ code: "ACCOUNT_CLOSURE_UNAVAILABLE", error:
      "A exclusão automática está suspensa para preservar seus dados. Procure o suporte; o encerramento dependerá de revisão de segurança e financeira." },
      { status: 409, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }
}
