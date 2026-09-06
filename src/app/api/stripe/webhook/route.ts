import {
  processCheckoutCompleted,
  processPaymentIntentSettlement,
} from "@/lib/services/payment-processor";

import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const signature =
    req.headers.get("stripe-signature");

  // ============================================================
  // 1. VERIFICA ASSINATURA
  // ============================================================

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

  // ============================================================
  // 2. VALIDA ASSINATURA STRIPE
  // ============================================================

  try {
    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
  } catch (error) {
    console.error(
      "WEBHOOK SIGNATURE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Assinatura inválida.",
      },
      {
        status: 400,
      }
    );
  }

  // ============================================================
  // 3. LOG DO EVENTO
  // ============================================================

  console.log(
    "================================================="
  );

  console.log(
    "STRIPE WEBHOOK"
  );

  console.log(
    "Event ID:",
    event.id
  );

  console.log(
    "Event Type:",
    event.type
  );

  console.log(
    "================================================="
  );

  // ============================================================
  // 4. REGISTRA EVENTO / IDEMPOTÊNCIA
  // ============================================================
  //
  // Cada evento Stripe possui um ID único.
  //
  // O event_id possui UNIQUE no banco.
  //
  // Isso impede que o mesmo evento seja processado
  // várias vezes.
  //
  // ============================================================

  try {
    const {
      data: existingEvent,
      error: existingEventError,
    } = await admin
      .from("stripe_webhook_events")
      .select(
        "id, event_id, event_type, status, created_at, processed_at"
      )
      .eq(
        "event_id",
        event.id
      )
      .maybeSingle();

    if (existingEventError) {
      console.error(
        "Erro ao verificar evento Stripe:",
        existingEventError
      );

      return NextResponse.json(
        {
          error:
            "Erro ao verificar evento.",
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================================
    // 4.1 EVENTO JÁ PROCESSADO
    // ==========================================================

    if (
      existingEvent?.status ===
      "processed"
    ) {
      console.log(
        "Evento Stripe já processado."
      );

      console.log(
        "Evento ignorado:",
        event.id
      );

      return NextResponse.json({
        received: true,
        duplicate: true,
      });
    }

    // ==========================================================
    // 4.2 EVENTO AINDA SENDO PROCESSADO
    // ==========================================================

    if (
      existingEvent?.status ===
      "processing"
    ) {
      console.log(
        "Evento Stripe já está sendo processado."
      );

      console.log(
        "Event ID:",
        event.id
      );

      // Retornamos 409 para que o Stripe possa tentar
      // novamente posteriormente.
      return NextResponse.json(
        {
          error:
            "Evento já está sendo processado.",
        },
        {
          status: 409,
        }
      );
    }

    // ==========================================================
    // 4.3 EVENTO FALHOU ANTERIORMENTE
    // ==========================================================

    if (
      existingEvent?.status ===
      "failed"
    ) {
      console.log(
        "Evento encontrado como failed."
      );

      console.log(
        "Tentando processar novamente:",
        event.id
      );

      const {
        error: retryUpdateError,
      } = await admin
        .from("stripe_webhook_events")
        .update({
          status:
            "processing",

          processed_at:
            null,
        })
        .eq(
          "event_id",
          event.id
        );

      if (
        retryUpdateError
      ) {
        console.error(
          "Erro ao reativar evento para processamento:",
          retryUpdateError
        );

        return NextResponse.json(
          {
            error:
              "Erro ao preparar nova tentativa.",
          },
          {
            status: 500,
          }
        );
      }
    }

    // ==========================================================
    // 4.4 EVENTO NOVO
    // ==========================================================

    if (!existingEvent) {
      const {
        error: insertEventError,
      } = await admin
        .from(
          "stripe_webhook_events"
        )
        .insert({
          event_id:
            event.id,

          event_type:
            event.type,

          status:
            "processing",
        });

      // ========================================================
      // PROTEÇÃO CONTRA CONCORRÊNCIA
      // ========================================================
      //
      // Se duas requisições chegarem exatamente ao mesmo tempo,
      // o UNIQUE event_id impede a duplicação.
      //
      // ========================================================

      if (
        insertEventError
      ) {
        if (
          insertEventError.code ===
          "23505"
        ) {
          console.log(
            "Evento já registrado por outra execução."
          );

          return NextResponse.json({
            received: true,
            duplicate: true,
          });
        }

        console.error(
          "Erro ao registrar evento Stripe:",
          insertEventError
        );

        return NextResponse.json(
          {
            error:
              "Erro ao registrar evento.",
          },
          {
            status: 500,
          }
        );
      }

      console.log(
        "Novo evento Stripe registrado."
      );
    }

    // ==========================================================
    // 5. PROCESSAMENTO DO EVENTO
    // ==========================================================

    switch (event.type) {

      // ========================================================
      // CHECKOUT CONCLUÍDO
      // ========================================================

      case "checkout.session.completed": {
        console.log(
          "Checkout concluído."
        );

        const session =
          event.data.object as Stripe.Checkout.Session;

        await processCheckoutCompleted({
          session,
        });

        break;
      }

      // ========================================================
      // PAYMENT INTENT SUCCEEDED
      // ========================================================

      case "payment_intent.succeeded": {
        console.log(
          "Pagamento aprovado."
        );

        const paymentIntent =
          event.data.object as Stripe.PaymentIntent;

        if (!event.account) {
          throw new Error(
            "Conta Stripe Connect não identificada no evento."
          );
        }

        await processPaymentIntentSettlement(
          paymentIntent.id,
          event.account
        );

        break;
      }

      // ========================================================
      // CHARGE SUCCEEDED
      // ========================================================

      case "charge.succeeded": {
        console.log(
          "Charge criada com sucesso."
        );

        const charge =
          event.data.object as Stripe.Charge;

        const paymentIntentId =
          typeof charge.payment_intent ===
          "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (
          paymentIntentId
        ) {
          console.log(
            "Tentando processar financeiro pelo Charge:",
            paymentIntentId
          );

          if (!event.account) {
            throw new Error(
              "Conta Stripe Connect não identificada no evento."
            );
          }

          await processPaymentIntentSettlement(
            paymentIntentId,
            event.account
          );
        } else {
          console.log(
            "Payment Intent não encontrado no Charge."
          );
        }

        break;
      }

      // ========================================================
      // FATURA PAGA
      // ========================================================

      case "invoice.paid": {
        console.log(
          "Fatura paga."
        );

        break;
      }

      // ========================================================
      // ASSINATURA CRIADA
      // ========================================================

      case "customer.subscription.created": {
        console.log(
          "Assinatura criada."
        );

        break;
      }

      // ========================================================
      // OUTROS EVENTOS
      // ========================================================

      default: {
        console.log(
          "Evento ignorado:",
          event.type
        );

        break;
      }
    }

    // ============================================================
    // 6. MARCA EVENTO COMO PROCESSADO
    // ============================================================

    const {
      error: processedUpdateError,
    } = await admin
      .from(
        "stripe_webhook_events"
      )
      .update({
        status:
          "processed",

        processed_at:
          new Date().toISOString(),
      })
      .eq(
        "event_id",
        event.id
      );

    if (
      processedUpdateError
    ) {
      console.error(
        "Erro ao marcar evento como processed:",
        processedUpdateError
      );

      return NextResponse.json(
        {
          error:
            "Evento processado, mas não foi possível atualizar o controle.",
        },
        {
          status: 500,
        }
      );
    }

    // ============================================================
    // 7. FINAL
    // ============================================================

    console.log(
      "================================================="
    );

    console.log(
      "WEBHOOK PROCESSADO COM SUCESSO"
    );

    console.log(
      "Event ID:",
      event.id
    );

    console.log(
      "Event Type:",
      event.type
    );

    console.log(
      "================================================="
    );

    return NextResponse.json({
      received: true,
    });

  } catch (error) {

    // ============================================================
    // 8. MARCA EVENTO COMO FAILED
    // ============================================================

    console.error(
      "ERRO AO PROCESSAR WEBHOOK:",
      error
    );

    const {
      error: failedUpdateError,
    } = await admin
      .from(
        "stripe_webhook_events"
      )
      .update({
        status:
          "failed",

        processed_at:
          null,
      })
      .eq(
        "event_id",
        event.id
      );

    if (
      failedUpdateError
    ) {
      console.error(
        "Erro ao marcar evento como failed:",
        failedUpdateError
      );
    }

    return NextResponse.json(
      {
        error:
          "Erro ao processar webhook.",
      },
      {
        status: 500,
      }
    );
  }
}