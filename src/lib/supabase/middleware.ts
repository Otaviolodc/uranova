import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authStagingEnabled } from "@/lib/security/staging-policy";

export async function updateSession(
  request: NextRequest
) {
  authStagingEnabled();
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  // Valida a sessão sem fazer uma busca completa
  // do usuário no servidor de Auth em toda requisição.
  const path = request.nextUrl.pathname;
  const privatePath = ["/dashboard", "/admin", "/checkout/success"].some(prefix => path === prefix || path.startsWith(prefix + "/"));
  if (privatePath) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      const redirect = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
      redirect.headers.set("Cache-Control", "private, no-store");
      return redirect;
    }
  } else {
    await supabase.auth.getClaims();
  }
  response.headers.set("Cache-Control", "private, no-store");

  return response;
}
