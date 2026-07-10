import { processCheckoutCompleted } from "@/lib/services/payment-processor";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "Assinatura ausente.",
      },
      {
        status: 400,
      }
    );
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("WEBHOOK SIGNATURE ERROR:", error);

    return NextResponse.json(
      {
        error: "Assinatura inválida.",
      },
      {
        status: 400,
      }
    );
  }

  console.log("=================================================");
  console.log("Stripe Event:", event.type);
  console.log("Event ID:", event.id);
  console.log("=================================================");

  switch (event.type) {

    case "checkout.session.completed": {

      console.log("Checkout concluído.");

      const session =
        event.data.object as Stripe.Checkout.Session;

      await processCheckoutCompleted({
        session,
      });

      break;
    }

    case "payment_intent.succeeded":

      console.log("Pagamento aprovado.");

      break;

    case "invoice.paid":

      console.log("Fatura paga.");

      break;

    case "customer.subscription.created":

      console.log("Assinatura criada.");

      break;

    default:

      console.log("Evento ignorado:", event.type);

  }

  return NextResponse.json({
    received: true,
  });
}