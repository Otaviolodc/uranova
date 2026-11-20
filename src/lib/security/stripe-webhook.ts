import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { integrationUnavailable } from "./staging-policy";

type Destination = "platform" | "connect";
type Verification = { event: Stripe.Event } | { response: Response };

/** Destination is selected by the route, never by unverified payload data. */
export async function verifyStripeWebhook(req: Request, destination: Destination): Promise<Verification> {
  const unavailable = integrationUnavailable();
  if (unavailable) return { response: unavailable };
  const principal = process.env.STRIPE_WEBHOOK_SECRET;
  const connect = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  const secret = destination === "connect" ? connect : principal;
  if (!secret?.trim() || (principal && connect && principal.trim() === connect.trim())) {
    return { response: Response.json({ error: "Configuração de webhook inválida." }, { status: 503 }) };
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return { response: Response.json({ error: "Assinatura ausente." }, { status: 400 }) };
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return { response: Response.json({ error: "Assinatura inválida." }, { status: 400 }) };
  }
  // Inspect scope only AFTER authentication, even for test/unsupported events.
  const validScope = destination === "connect"
    ? typeof event.account === "string" && /^acct_[A-Za-z0-9]+$/.test(event.account)
    : event.account === undefined;
  if (!validScope) {
    return { response: Response.json({ error: "Escopo de webhook inválido." }, { status: 400 }) };
  }
  return { event };
}
