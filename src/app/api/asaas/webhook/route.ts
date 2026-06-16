import { NextResponse }
from "next/server";

import { createClient }
from "@supabase/supabase-js";

const supabase = createClient(

  process.env
    .NEXT_PUBLIC_SUPABASE_URL!,

  process.env
    .SUPABASE_SERVICE_ROLE_KEY!

);

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const payment = body.payment;

    if (!body.event) {

  return NextResponse.json(
    {
      error: "Evento inválido",
    },
    {
      status: 400,
    }
  );

}

  if (!payment?.id) {

  return NextResponse.json(
    {
      error: "Pagamento inválido",
    },
    {
      status: 400,
    }
  );

}

    if (!payment?.externalReference) {
      return NextResponse.json(
        {
          error: "Sem externalReference",
        },
        {
          status: 400,
        }
      );
    }

    const userId = payment.externalReference;

    // =========================
    // PAGAMENTO CONFIRMADO
    // =========================

    await supabase
  .from("payments")
  .update({
    status: payment.status,
  })
  .eq(
    "asaas_payment_id",
    payment.id
  );

if (
  body.event === "PAYMENT_RECEIVED" ||
  body.event === "PAYMENT_CONFIRMED"
) {

  const { data: existingOrder } =
    await supabase
      .from("orders")
      .select("id")
      .eq("payment_id", payment.id)
      .maybeSingle();

  if (!existingOrder) {

    await supabase
      .from("orders")
      .insert({
        user_id: userId,

        product_id:
          payment.description,

        amount:
          payment.value,

        customer_name:
          payment.customer,

        customer_email: "",

        status: "paid",

        payment_id:
          payment.id,
      });

  }

}
    
return NextResponse.json({
  success: true,
});

  } catch (error) {
    console.error(
      "ASAAS WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Webhook error",
      },
      {
        status: 500,
      }
    );
  }

}
