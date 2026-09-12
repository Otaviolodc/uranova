import {
  processCheckoutCompleted,
  processPaymentIntentSettlement,
} from "@/lib/services/payment-processor";

import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Verifica se o PaymentIntent já foi registrado como PAID.
 *
 * IMPORTANTE:
 * O payment processor possui alguns retornos silenciosos para situações
 * transitórias do Stripe (por exemplo, Charge/Balance Transaction ainda
 * não disponível). O webhook NÃO pode marcar o evento como processed
 * nesses casos, porque isso impediria o retry automático do Stripe.
 */
async function assertPaymentSettled(paymentIntentId: string) {
  const { data, error } = await admin
    .from("payments")
    .select("id, status, payment_provider_id")
    .eq("payment_provider_id", paymentIntentId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao verificar settlement do pagamento ${paymentIntentId}: ${error.message}`
    );
  }

  if (!data || data.status !== "PAID") {
    throw new Error(
      `Settlement ainda não confirmado para PaymentIntent ${paymentIntentId}.`
    );
  }

  return data;
}

function getPaymentIntentIdFromCharge(charge: Stripe.Charge) {
  return typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : charge.payment_intent?.id ?? null;
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Assinatura ausente." },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: Stripe.Event;

  // ============================================================
  // 1. VALIDA ASSINATURA STRIPE
  // ============================================================
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("WEBHOOK SIGNATURE ERROR:", error);

    return NextResponse.json(
      { error: "Assinatura inválida." },
      { status: 400 }
    );
  }

  console.log("=================================================");
  console.log("STRIPE WEBHOOK");
  console.log("Event ID:", event.id);
  console.log("Event Type:", event.type);
  console.log("Stripe Account:", event.account ?? "platform");
  console.log("=================================================");

  try {
    // ============================================================
    // 2. IDEMPOTÊNCIA DO EVENTO
    // ============================================================
    const { data: existingEvent, error: existingEventError } = await admin
      .from("stripe_webhook_events")
      .select("id, event_id, event_type, status, created_at, processed_at")
      .eq("event_id", event.id)
      .maybeSingle();

    if (existingEventError) {
      throw new Error(
        `Erro ao verificar evento Stripe: ${existingEventError.message}`
      );
    }

    if (existingEvent?.status === "processed") {
      console.log("Evento Stripe já processado:", event.id);

      return NextResponse.json({
        received: true,
        duplicate: true,
      });
    }

    if (existingEvent?.status === "processing") {
      console.log("Evento Stripe já está sendo processado:", event.id);

      return NextResponse.json(
        { error: "Evento já está sendo processado." },
        { status: 409 }
      );
    }

    if (existingEvent?.status === "failed") {
      const { error: retryUpdateError } = await admin
        .from("stripe_webhook_events")
        .update({
          status: "processing",
          processed_at: null,
        })
        .eq("event_id", event.id);

      if (retryUpdateError) {
        throw new Error(
          `Erro ao reativar evento para processamento: ${retryUpdateError.message}`
        );
      }
    }

    if (!existingEvent) {
      const { error: insertEventError } = await admin
        .from("stripe_webhook_events")
        .insert({
          event_id: event.id,
          event_type: event.type,
          status: "processing",
        });

      // Duas entregas simultâneas do mesmo evento.
      if (insertEventError?.code === "23505") {
        console.log("Evento já registrado por outra execução:", event.id);

        return NextResponse.json({
          received: true,
          duplicate: true,
        });
      }

      if (insertEventError) {
        throw new Error(
          `Erro ao registrar evento Stripe: ${insertEventError.message}`
        );
      }
    }

    // ============================================================
    // 3. PROCESSAMENTO
    // ============================================================
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        await processCheckoutCompleted({ session });

        const paymentIntentId = session.payment_intent
          ? String(session.payment_intent)
          : null;

        if (!paymentIntentId) {
          throw new Error(
            `Checkout ${session.id} não possui PaymentIntent.`
          );
        }

        // O processor pode ter concluído o pedido/liberação mas ainda
        // estar aguardando a Charge/Balance Transaction. Nesse caso,
        // lançar erro mantém o evento como failed e permite retry do Stripe.
        await assertPaymentSettled(paymentIntentId);

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        if (!event.account) {
          throw new Error(
            "Conta Stripe Connect não identificada no evento payment_intent.succeeded."
          );
        }

        await processPaymentIntentSettlement(
          paymentIntent.id,
          event.account
        );

        await assertPaymentSettled(paymentIntent.id);

        break;
      }

      case "charge.succeeded":
      case "charge.updated": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = getPaymentIntentIdFromCharge(charge);

        // charge.updated pode existir sem PaymentIntent em alguns cenários.
        // Não há settlement financeiro para executar nesses casos.
        if (!paymentIntentId) {
          console.log(
            `Charge ${charge.id} sem PaymentIntent. Evento ignorado.`
          );
          break;
        }

        if (!event.account) {
          throw new Error(
            `Conta Stripe Connect não identificada no evento ${event.type}.`
          );
        }

        await processPaymentIntentSettlement(
          paymentIntentId,
          event.account
        );

        await assertPaymentSettled(paymentIntentId);

        break;
      }

      case "invoice.paid": {
        console.log("Fatura paga. Evento sem impacto no fluxo de venda digital.");
        break;
      }

      case "customer.subscription.created": {
        console.log(
          "Assinatura criada. Evento sem impacto no fluxo de venda digital."
        );
        break;
      }

      default: {
        console.log("Evento ignorado:", event.type);
        break;
      }
    }

    // ============================================================
    // 4. SÓ MARCA COMO PROCESSED APÓS O PROCESSAMENTO REAL
    // ============================================================
    const { error: processedUpdateError } = await admin
      .from("stripe_webhook_events")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("event_id", event.id);

    if (processedUpdateError) {
      throw new Error(
        `Evento processado, mas não foi possível atualizar o controle: ${processedUpdateError.message}`
      );
    }

    console.log("=================================================");
    console.log("WEBHOOK PROCESSADO COM SUCESSO");
    console.log("Event ID:", event.id);
    console.log("Event Type:", event.type);
    console.log("=================================================");

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("ERRO AO PROCESSAR WEBHOOK:", error);

    // O status failed é importante para auditoria e para permitir que
    // uma nova entrega do mesmo evento tente o processamento novamente.
    const { error: failedUpdateError } = await admin
      .from("stripe_webhook_events")
      .update({
        status: "failed",
        processed_at: null,
      })
      .eq("event_id", event.id);

    if (failedUpdateError) {
      console.error(
        "Erro ao marcar evento como failed:",
        failedUpdateError
      );
    }

    return NextResponse.json(
      { error: "Erro ao processar webhook." },
      { status: 500 }
    );
  }
}
