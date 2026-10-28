import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { authStagingEnabled, stagingPathAllowed, stagingPreviewOrigin } from "@/lib/security/staging-policy";

export async function middleware(
  request: NextRequest
) {
  try {
    if (authStagingEnabled()) {
      if (new URL(stagingPreviewOrigin(process.env)).host !== request.headers.get("host")) {
        return NextResponse.json({error:"Staging host unavailable."},{status:503,headers:{"Cache-Control":"no-store"}});
      }
      if (["/dashboard","/admin"].includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/auth/staging-status",request.url));
      }
      if (!stagingPathAllowed(request.nextUrl.pathname)) {
        return NextResponse.json({error:"Auth-only staging."},{status:503,headers:{"Cache-Control":"no-store"}});
      }
      // Defense in depth for browser fetches: only the isolated Auth origin is needed.
      const response = request.nextUrl.pathname.startsWith("/auth/")
        ? await updateSession(request) : NextResponse.next();
      response.headers.set("Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; connect-src 'self' https://unkupjzifylpredkenvj.supabase.co; " +
        "frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
      response.headers.set("Cache-Control","no-store");
      return response;
    }
  } catch {
    return NextResponse.json({error:"Environment unavailable."},{status:503,headers:{"Cache-Control":"no-store"}});
  }
  // Preserve production session refresh scope.
  const path = request.nextUrl.pathname;
  return ["/dashboard","/admin","/auth"].some(prefix=>path===prefix||path.startsWith(prefix+"/"))
    ? await updateSession(request) : NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static/).*)",
  ],
};
