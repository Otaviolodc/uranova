import {
  processCheckoutCompleted,
  processPaymentIntentSettlement,
} from "@/lib/services/payment-processor";

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

  try {
    switch (event.type) {
      // =====================================================
      // CHECKOUT CONCLUÍDO
      // =====================================================

      case "checkout.session.completed": {
        console.log("Checkout concluído.");

        const session =
          event.data.object as Stripe.Checkout.Session;

        await processCheckoutCompleted({
          session,
        });

        break;
      }

      // =====================================================
      // PAGAMENTO APROVADO
      // =====================================================

      case "payment_intent.succeeded": {
        console.log("Pagamento aprovado.");

        const paymentIntent =
          event.data.object as Stripe.PaymentIntent;

        await processPaymentIntentSettlement(
          paymentIntent.id
        );

        break;
      }

      // =====================================================
      // CHARGE SUCCEEDED
      // =====================================================

      case "charge.succeeded": {
        console.log("Charge criada com sucesso.");

        const charge =
          event.data.object as Stripe.Charge;

        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (paymentIntentId) {
          console.log(
            "Tentando processar financeiro pelo Charge:",
            paymentIntentId
          );

          await processPaymentIntentSettlement(
            paymentIntentId
          );
        } else {
          console.log(
            "Payment Intent não encontrado no Charge."
          );
        }

        break;
      }

      // =====================================================
      // CHARGE UPDATED
      // =====================================================

      case "charge.updated": {
        console.log(
          "Charge atualizada. Tentando novamente o financeiro."
        );

        const charge =
          event.data.object as Stripe.Charge;

        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (paymentIntentId) {
          console.log(
            "Retry financeiro pelo Charge Updated:",
            paymentIntentId
          );

          await processPaymentIntentSettlement(
            paymentIntentId
          );
        } else {
          console.log(
            "Payment Intent não encontrado no Charge Updated."
          );
        }

        break;
      }

      // =====================================================
      // FATURA PAGA
      // =====================================================

      case "invoice.paid": {
        console.log("Fatura paga.");
        break;
      }

      // =====================================================
      // ASSINATURA CRIADA
      // =====================================================

      case "customer.subscription.created": {
        console.log("Assinatura criada.");
        break;
      }

      // =====================================================
      // OUTROS EVENTOS
      // =====================================================

      default: {
        console.log(
          "Evento ignorado:",
          event.type
        );
      }
    }
  } catch (error) {
    console.error(
      "ERRO AO PROCESSAR WEBHOOK:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro ao processar webhook.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    received: true,
  });
}