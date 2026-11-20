import { NextResponse } from "next/server";
import { verifyStripeWebhook } from "@/lib/security/stripe-webhook";

export const runtime = "nodejs";

/** Platform events have no Direct Charge settlement handler. */
export async function POST(req: Request) {
  const verified = await verifyStripeWebhook(req, "platform");
  if ("response" in verified) return verified.response;
  const event = verified.event;
  const reason = event.livemode ? "platform_event_without_connect_account" : "test_mode";
  console.info("Stripe webhook outcome", { eventId: event.id, type: event.type, outcome: "ignored", reason });
  return NextResponse.json({ received: true, outcome: "ignored", reason });
}
