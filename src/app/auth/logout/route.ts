import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sameOrigin, safeError } from "@/lib/security/request";
import { createHash } from "node:crypto";

// Static CSS is authorized by its hash; scripts and arbitrary inline styles stay blocked.
const styles = `
*{box-sizing:border-box}body{margin:0;background:#050505;color:#fafafa;font-family:Arial,Helvetica,sans-serif;min-height:100svh;display:grid;place-items:center;padding:24px}
main{width:100%;max-width:512px;border:1px solid #27272a;border-radius:24px;background:#09090b;padding:32px 24px 40px;text-align:center;box-shadow:0 0 50px #0007}
img{display:block;width:100%;max-width:360px;height:auto;margin:0 auto 28px}h1{font-size:26px;line-height:1.2;margin:0 0 16px}p{color:#a1a1aa;line-height:1.6;margin:0 0 28px}
button{width:100%;min-height:48px;border:0;border-radius:12px;background:#22c55e;color:#000;font:600 16px Arial,Helvetica,sans-serif;cursor:pointer;padding:12px}button:hover{background:#4ade80}
a{display:inline-block;margin-top:24px;color:#d4d4d8;line-height:1.5;padding:8px}a:hover{color:#fff}a:focus-visible,button:focus-visible{outline:3px solid #86efac;outline-offset:4px}
@media(min-width:640px){main{padding-left:48px;padding-right:48px}}
`;
const styleHash = createHash("sha256").update(styles).digest("base64");

// Navigation (including prefetches and external links) must not mutate a session.
export async function GET() {
  return new Response(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sair da Uranova</title><style>${styles}</style></head><body><main aria-labelledby="logout-title">
<img src="/uranova-logo.svg" alt="Uranova" width="360" height="84">
<h1 id="logout-title">Sair da sua conta?</h1>
<p>Confirme para encerrar sua sessão. Você poderá entrar novamente quando quiser.</p>
<form method="post" action="/auth/logout"><button type="submit">Confirmar saída</button></form>
<a href="/dashboard">Voltar ao painel</a></main></body></html>`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": `default-src 'none'; img-src 'self'; style-src 'sha256-${styleHash}'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'`,
      // no-referrer makes native form POSTs send Origin: null, failing sameOrigin.
      // Keep the real same-origin Origin without disclosing Referer cross-origin.
      "Referrer-Policy": "same-origin",
    },
  });
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error("LOGOUT_FAILED");
    const response = NextResponse.redirect(new URL("/auth/login", request.url), 303);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return safeError(error);
  }
}
