export function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const unavailable = params.get("unavailable") === "1";
  const retry = Math.min(3600, Math.max(1, Number(params.get("retry")) || 60));
  return new Response(unavailable ? "Servico temporariamente indisponivel." : "Muitas tentativas. Aguarde antes de tentar novamente.", {
    status: unavailable ? 503 : 429,
    headers: {"Cache-Control":"no-store", "Retry-After":String(Math.ceil(retry)), "Content-Type":"text/plain; charset=utf-8"},
  });
}
