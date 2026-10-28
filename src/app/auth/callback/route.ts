import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") === "/auth/reset-password" ? "/auth/reset-password" : "/dashboard";
  const headers = {"Cache-Control":"no-store", "Referrer-Policy":"no-referrer"};
  if (code && code.length <= 2048 && !url.searchParams.has("error")) {
    try {
      const client = await createClient();
      const {data,error} = await client.auth.exchangeCodeForSession(code);
      if (!error && data.session && data.user) {
        return new Response(null,{status:303,headers:{...headers,Location:new URL(next,url.origin).href}});
      }
    } catch { /* Invalid, expired or cross-browser PKCE flow: no session bypass. */ }
  }
  return new Response(null,{status:303,headers:{...headers,Location:new URL("/auth/login?error=confirmation_failed",url.origin).href}});
}
