import "server-only";
import { createClient as createIsolatedClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { authStagingEnabled } from "@/lib/security/staging-policy";
import { RateLimitError } from "@/lib/security/rate-limit";


export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin || origin !== new URL(req.url).origin) throw new Error("FORBIDDEN");
}
export async function jsonBody(req: Request, limit = 8192): Promise<unknown> {
  if (!req.headers.get("content-type")?.startsWith("application/json")) throw new Error("INVALID_INPUT");
  if (Number(req.headers.get("content-length") ?? 0) > limit) throw new Error("INVALID_INPUT");
  const reader = req.body?.getReader();
  if (!reader) throw new Error("INVALID_INPUT");
  const chunks: Uint8Array[] = []; let size = 0;
  for (;;) { const {done,value} = await reader.read(); if (done) break; size += value.length;
    if (size > limit) { await reader.cancel(); throw new Error("INVALID_INPUT"); } chunks.push(value); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new Error("INVALID_INPUT"); }
}
export async function reauthenticate(user: User, password: unknown) {
  authStagingEnabled();
  if (!user.email) throw new Error("REAUTH_REQUIRED");
  if (typeof password !== "string" || !password || password.length > 1024) throw new Error("REAUTH_REQUIRED");
  const secret = password;
  const isolated = createIsolatedClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const {data,error} = await isolated.auth.signInWithPassword({email:user.email,password:secret});
  const valid = !error && data.user?.id === user.id;
  if (data.session) await isolated.auth.signOut({scope:"local"});
  if (!valid) throw new Error("REAUTH_REQUIRED");
}
export function safeError(error: unknown) {
  if (error instanceof RateLimitError) return Response.json({error:"Muitas tentativas. Aguarde antes de tentar novamente."}, {status:429,headers:{"Cache-Control":"no-store","Retry-After":String(error.retryAfter)}});
  const code = error instanceof Error ? error.message : "ERROR";
  const status = code === "UNAUTHENTICATED" ? 401 : ["FORBIDDEN","REAUTH_REQUIRED"].includes(code) ? 403 : code === "INVALID_INPUT" ? 400 : 503;
  return Response.json({error:status===401?"Autenticação necessária.":status===403?"Ação não autorizada. Confirme sua identidade.":status===400?"Dados inválidos.":"Operação indisponível. Tente novamente ou procure o suporte."}, {status,headers:{"Cache-Control":"no-store"}});
}
