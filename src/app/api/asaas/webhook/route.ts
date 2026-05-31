import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "WEBHOOK RECEBIDO:",
      JSON.stringify(body, null, 2)
    );

    const payment = body.payment;

    if (!payment?.externalReference) {
      return NextResponse.json({
        error: "Sem externalReference",
      });
    }

    const userId = payment.externalReference;

    // =========================
    // PAGAMENTO CONFIRMADO
    // =========================
    if (
      body.event === "PAYMENT_RECEIVED" ||
      body.event === "PAYMENT_CONFIRMED"
    ) {

      console.log("LIBERANDO PRO:", userId);

    // =========================
    // SALVAR VENDA
    // =========================

      await supabase
        .from("orders")
        .insert({

          user_id: userId,

          product_id: payment.description,

          amount: payment.value,

          customer_name: payment.customer,

          customer_email: "",

          status: "paid",

          payment_id: payment.id,

        });

      const { error } = await supabase
        .from("profiles")
        .update({
          is_pro: true,
          subscription_status: "active",
          subscription_plan: "pro",
          subscription_end_date: payment.dueDate,
        })
        .eq("id", userId);

      if (error) {
        console.log(error);

        return NextResponse.json({
          error: error.message,
        });
      }

      console.log("USUÁRIO LIBERADO");
    }

    // =========================
    // ASSINATURA CANCELADA
    // =========================
    if (
      body.event === "PAYMENT_DELETED" ||
      body.event === "PAYMENT_OVERDUE"
    ) {

      console.log("REMOVENDO PRO:", userId);

      const { error } = await supabase
        .from("profiles")
        .update({
          is_pro: false,
          subscription_status: "inactive",
          subscription_plan: "free",
        })
        .eq("id", userId);

      if (error) {
        console.log(error);

        return NextResponse.json({
          error: error.message,
        });
      }

      console.log("PRO REMOVIDO");
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json({
      error: "Webhook error",
    });
  }
}