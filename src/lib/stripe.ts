import "server-only";
import Stripe from "stripe";
import { assertIntegrationsEnabled } from "@/lib/security/staging-policy";
import { lazyClient } from "@/lib/security/lazy-client";

export const stripe = lazyClient(() => new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: "2026-06-24.dahlia",
  }
), assertIntegrationsEnabled);

export function assertStripeLive() {
  assertIntegrationsEnabled();
  if (!/^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? "")) {
    throw new Error("Stripe Live não configurado.");
  }
}
