import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: "2026-06-24.dahlia",
  }
);

export function assertStripeLive() {
  if (!/^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? "")) {
    throw new Error("Stripe Live não configurado.");
  }
}
