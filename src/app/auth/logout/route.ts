import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sameOrigin, safeError } from "@/lib/security/request";

// Navigation (including prefetches and external links) must not mutate a session.
export async function GET() {
  return new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sair da Uranova</title><main><h1>Sair da sua conta?</h1>
<form method="post" action="/auth/logout"><button type="submit">Confirmar saída</button></form>
<p><a href="/dashboard">Voltar ao painel</a></p></main></html>`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
      "Referrer-Policy": "no-referrer",
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
