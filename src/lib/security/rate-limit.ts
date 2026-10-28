import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { admin } from "@/lib/supabase/admin";

export type RateScope = "checkout" | "payout" | "connect" | "password" | "upload" | "download" | "ai" | "sync" | "tracking" | "admin";
export class RateLimitError extends Error {
  constructor(public readonly retryAfter: number) { super("RATE_LIMITED"); }
}

// Only Vercel's overwritten header is accepted. No client-supplied forwarding fallback.
export function trackingPrincipal(req: Request): string {
  if (process.env.VERCEL !== "1") {
    if (process.env.NODE_ENV !== "production") return "development";
    throw new Error("TRUSTED_IP_UNAVAILABLE");
  }
  const ip = req.headers.get("x-vercel-forwarded-for")?.trim();
  const version = ip ? isIP(ip) : 0;
  if (!version || !ip) throw new Error("TRUSTED_IP_UNAVAILABLE");
  // Canonicalize IPv6 spelling and group /64 to limit trivial address rotation.
  if (version === 6) {
    const canonical = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
    const [left, right = ""] = canonical.split("::");
    const a = left ? left.split(":") : [], b = right ? right.split(":") : [];
    return "ip6:" + [...a, ...Array(8-a.length-b.length).fill("0"), ...b].slice(0,4).map(x=>x.padStart(4,"0")).join(":");
  }
  return "ip4:" + ip;
}

export async function rateLimit(scope: RateScope, principal: string) {
  if (!principal || principal.length > 200) throw new Error("INVALID_RATE_PRINCIPAL");
  const key = createHash("sha256").update(scope + ":" + principal).digest("hex");
  const { data, error } = await admin.rpc("phase_a1_consume_rate_limit", { p_scope: scope, p_key: key });
  if (error || !data || typeof data.allowed !== "boolean" || !Number.isInteger(data.retry_after) || data.retry_after < 0 || data.retry_after > 3600) {
    throw new Error("RATE_LIMIT_UNAVAILABLE");
  }
  if (!data.allowed) throw new RateLimitError(Math.max(1, data.retry_after));
}
