import { stripe } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";
import Stripe from "stripe";

const PLATFORM_FEE_PERCENT = 10;

interface ProcessCheckoutCompletedParams {
  session: Stripe.Checkout.Session;
}

/**
 * ============================================================
 * PROCESSA CHECKOUT CONCLUÍDO
 * ============================================================
 *
 * MODELO FINANCEIRO URANOVA
 *
 * Direct Charge — Stripe Connect
 *
 * Exemplo:
 *
 * Venda                    R$100,00
 * Uranova 10%              R$ 10,00
 * Stripe                   desconta sua taxa do produtor
 * Produtor                 R$90,00 - taxa Stripe
 *
 * A comissão Uranova NÃO é reduzida pela taxa Stripe.
 *
 * O pagamento é criado diretamente na conta Stripe Connect
 * do produtor.
 *
 * A Uranova recebe sua application_fee_amount.
 *
 * NÃO existe Transfer manual.
 */
export async function processCheckoutCompleted({
  session,
}: ProcessCheckoutCompletedParams) {
  try {
    // ======================================================
    // 1. METADATA
    // ======================================================

    const productId = session.metadata?.product_id;
    const sellerId = session.metadata?.seller_id;
    const customerId = session.metadata?.customer_id;

    if (!productId || !sellerId || !customerId) {
      console.error(
        "Metadata inválida no checkout."
      );

      return;
    }

    // ======================================================
    // 2. PAYMENT INTENT
    // ======================================================

    const paymentIntentId = session.payment_intent
      ? String(session.payment_intent)
      : null;

    if (!paymentIntentId) {
      console.error(
        "Payment Intent não encontrado."
      );

      return;
    }

    // ======================================================
    // 3. CONTA STRIPE CONNECT DO PRODUTOR
    // ======================================================

    const {
      data: sellerProfile,
      error: sellerProfileError,
    } = await admin
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", sellerId)
      .single();

    if (
      sellerProfileError ||
      !sellerProfile?.stripe_account_id
    ) {
      console.error(
        "Conta Stripe do produtor não encontrada:",
        sellerProfileError
      );

      return;
    }

    const sellerStripeAccountId =
      sellerProfile.stripe_account_id;

    // ======================================================
    // 4. LOG
    // ======================================================

    console.log(
      "===================================="
    );

    console.log(
      "PAYMENT PROCESSOR"
    );

    console.log(
      "===================================="
    );

    console.log(
      "Session ID:",
      session.id
    );

    console.log(
      "Payment Status:",
      session.payment_status
    );

    console.log(
      "Payment Intent:",
      paymentIntentId
    );

    console.log(
      "Seller ID:",
      sellerId
    );

    console.log(
      "Stripe Connect:",
      sellerStripeAccountId
    );

    console.log(
      "Customer ID:",
      customerId
    );

    // ======================================================
    // 5. STATUS DO PAGAMENTO
    // ======================================================

    if (
      session.payment_status !== "paid"
    ) {
      console.log(
        "Pagamento ainda não está confirmado como pago."
      );

      return;
    }

    // ======================================================
    // 6. PRODUTO
    // ======================================================

    const {
      data: product,
      error: productError,
    } = await admin
      .from("products_checkout")
      .select("*")
      .eq("id", productId)
      .single();

    if (
      productError ||
      !product
    ) {
      console.error(
        "Produto não encontrado:",
        productError
      );

      return;
    }

    // ======================================================
    // 7. CONFIRMA PRODUTOR
    // ======================================================

    if (
      product.user_id !== sellerId
    ) {
      console.error(
        "Inconsistência: produtor do produto diferente do seller_id."
      );

      return;
    }

    console.log(
      "Produto:",
      product.title
    );

    // ======================================================
    // 8. CLIENTE
    // ======================================================

    const customerName =
      session.customer_details?.name ??
      "Cliente Stripe";

    const customerEmail =
      session.customer_details?.email ??
      "";

    // ======================================================
    // 9. VERIFICA SE CLIENTE JÁ POSSUI O PRODUTO
    // ======================================================

    const {
      data: existingCustomerProduct,
      error: existingCustomerProductError,
    } = await admin
      .from("customer_products")
      .select("id, order_id")
      .eq(
        "customer_id",
        customerId
      )
      .eq(
        "product_id",
        product.product_id
      )
      .maybeSingle();

    if (
      existingCustomerProductError
    ) {
      console.error(
        "Erro ao verificar produto do cliente:",
        existingCustomerProductError
      );

      return;
    }

    let orderId:
      | string
      | null =
      existingCustomerProduct?.order_id ??
      null;

    // ======================================================
    // 10. CRIA PEDIDO
    // ======================================================

    if (!orderId) {
      const grossAmount =
        session.amount_total !== null
          ? Number(
              session.amount_total
            ) / 100
          : 0;

      if (
        !Number.isFinite(
          grossAmount
        ) ||
        grossAmount <= 0
      ) {
        console.error(
          "Valor bruto inválido:",
          grossAmount
        );

        return;
      }

      const {
        data: order,
        error: orderError,
      } = await admin
        .from("orders")
        .insert({
          user_id:
            sellerId,

          product_id:
            product.product_id,

          amount:
            grossAmount,

          customer_name:
            customerName,

          customer_email:
            customerEmail,

          status:
            "PAID",
        })
        .select()
        .single();

      if (
        orderError ||
        !order
      ) {
        console.error(
          "Erro ao criar pedido:",
          orderError
        );

        return;
      }

      orderId =
        order.id;

      console.log(
        "Pedido criado:",
        order.id
      );
    } else {
      console.log(
        "Pedido já existente:",
        orderId
      );
    }

    // ======================================================
    // 11. LIBERA PRODUTO
    // ======================================================

    const {
      data: customerProductAfterCheck,
      error:
        customerProductAfterCheckError,
    } = await admin
      .from("customer_products")
      .select("id")
      .eq(
        "customer_id",
        customerId
      )
      .eq(
        "product_id",
        product.product_id
      )
      .maybeSingle();

    if (
      customerProductAfterCheckError
    ) {
      console.error(
        "Erro ao verificar liberação do produto:",
        customerProductAfterCheckError
      );

      return;
    }

    if (
      !customerProductAfterCheck
    ) {
      const {
        error: customerProductError,
      } = await admin
        .from("customer_products")
        .insert({
          customer_id:
            customerId,

          product_id:
            product.product_id,

          order_id:
            orderId,

          status:
            "active",
        });

      if (
        customerProductError
      ) {
        console.error(
          "Erro ao liberar produto:",
          customerProductError
        );

        return;
      }

      console.log(
        "Produto liberado para o cliente."
      );
    } else {
      console.log(
        "Produto já estava liberado para o cliente."
      );
    }

    // ======================================================
    // 12. PROCESSAMENTO FINANCEIRO
    // ======================================================

    await processFinancialSettlement({
      session,
      sellerId,
      sellerStripeAccountId,
      paymentIntentId,
      orderId,
      customerName,
      customerEmail,
    });

    console.log(
      "Checkout processado com sucesso."
    );

  } catch (error) {
    console.error(
      "ERRO NO PAYMENT PROCESSOR:",
      error
    );
  }
}


/**
 * ============================================================
 * PROCESSAMENTO FINANCEIRO
 * ============================================================
 *
 * DIRECT CHARGE
 *
 * Venda:
 * R$100,00
 *
 * Uranova:
 * R$10,00
 *
 * Stripe:
 * desconta sua taxa da conta do produtor
 *
 * Produtor:
 * R$90,00 - taxa Stripe
 *
 * A Uranova recebe exatamente sua comissão.
 */
async function processFinancialSettlement({
  session,
  sellerId,
  sellerStripeAccountId,
  paymentIntentId,
  orderId,
  customerName,
  customerEmail,
}: {
  session: Stripe.Checkout.Session;
  sellerId: string;
  sellerStripeAccountId: string;
  paymentIntentId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
}) {
  // ======================================================
  // 1. IDEMPOTÊNCIA
  // ======================================================

  const {
    data: existingPayment,
    error: existingPaymentError,
  } = await admin
    .from("payments")
    .select("id")
    .eq(
      "payment_provider_id",
      paymentIntentId
    )
    .maybeSingle();

  if (
    existingPaymentError
  ) {
    console.error(
      "Erro ao verificar pagamento financeiro:",
      existingPaymentError
    );

    return;
  }

  if (
    existingPayment
  ) {
    console.log(
      "Pagamento financeiro já processado."
    );

    return;
  }

  // ======================================================
  // 2. PAYMENT INTENT
  // ======================================================
  //
  // IMPORTANTE:
  //
  // O Payment Intent pertence à conta Stripe do produtor.
  //
  // Por isso precisamos informar stripeAccount.
  //
  // ======================================================

  const paymentIntent =
    await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: [
          "latest_charge.balance_transaction",
        ],
      },
      {
        stripeAccount:
          sellerStripeAccountId,
      }
    );

  // ======================================================
  // 3. VALOR BRUTO
  // ======================================================

  const grossAmount =
    session.amount_total !== null
      ? Number(
          session.amount_total
        ) / 100
      : Number(
          paymentIntent.amount_received
        ) / 100;

  if (
    !Number.isFinite(
      grossAmount
    ) ||
    grossAmount <= 0
  ) {
    console.error(
      "Valor bruto inválido:",
      grossAmount
    );

    return;
  }

  // ======================================================
  // 4. CHARGE
  // ======================================================

  const latestCharge =
    paymentIntent.latest_charge;

  if (!latestCharge) {
    console.log(
      "Charge ainda não disponível."
    );

    return;
  }

  const charge =
    typeof latestCharge === "string"
      ? await stripe.charges.retrieve(
          latestCharge,
          {
            expand: [
              "balance_transaction",
            ],
          },
          {
            stripeAccount:
              sellerStripeAccountId,
          }
        )
      : latestCharge;

  // ======================================================
  // 5. BALANCE TRANSACTION
  // ======================================================

  const balanceTransaction =
    typeof charge.balance_transaction ===
    "string"
      ? await stripe.balanceTransactions.retrieve(
          charge.balance_transaction,
          {},
          {
            stripeAccount:
              sellerStripeAccountId,
          }
        )
      : charge.balance_transaction;

  if (
    !balanceTransaction
  ) {
    console.log(
      "Balance Transaction ainda não disponível."
    );

    return;
  }

  // ======================================================
  // 6. TAXA REAL DA STRIPE
  // ======================================================

  const stripeFee =
    Number(
      balanceTransaction.fee
    ) / 100;

  if (
    !Number.isFinite(
      stripeFee
    ) ||
    stripeFee < 0
  ) {
    console.error(
      "Taxa Stripe inválida:",
      stripeFee
    );

    return;
  }

  // ======================================================
  // 7. COMISSÃO URANOVA
  // ======================================================

  const platformFee =
    Math.round(
      grossAmount *
        (PLATFORM_FEE_PERCENT / 100) *
        100
    ) / 100;

  // ======================================================
  // 8. PRODUTOR
  // ======================================================
  //
  // A taxa Stripe é responsabilidade do produtor.
  //
  // Portanto:
  //
  // produtor =
  // venda
  // - Uranova
  // - Stripe
  //
  // ======================================================

  const producerAmount =
    Math.round(
      (
        grossAmount -
        platformFee -
        stripeFee
      ) *
        100
    ) / 100;

  // ======================================================
  // 9. URANOVA
  // ======================================================
  //
  // A comissão da Uranova permanece integral.
  //
  // ======================================================

  const platformNet =
    platformFee;

  // ======================================================
  // 10. VALIDAÇÕES
  // ======================================================

  if (
    !Number.isFinite(
      platformFee
    ) ||
    platformFee <= 0
  ) {
    console.error(
      "Comissão Uranova inválida:",
      platformFee
    );

    return;
  }

  if (
    !Number.isFinite(
      producerAmount
    ) ||
    producerAmount < 0
  ) {
    console.error(
      "Valor do produtor inválido:",
      producerAmount
    );

    return;
  }

  // ======================================================
  // 11. CONCILIAÇÃO
  // ======================================================

  const calculatedTotal =
    Math.round(
      (
        platformFee +
        producerAmount +
        stripeFee
      ) *
        100
    );

  const grossTotal =
    Math.round(
      grossAmount *
        100
    );

  if (
    calculatedTotal !==
    grossTotal
  ) {
    console.error(
      "Erro de conciliação financeira."
    );

    console.error({
      grossAmount,
      platformFee,
      stripeFee,
      producerAmount,
      calculatedTotal,
      grossTotal,
    });

    return;
  }

  // ======================================================
  // 12. LOG
  // ======================================================

  console.log(
    "===================================="
  );

  console.log(
    "FINANCIAL CALCULATION"
  );

  console.log(
    "===================================="
  );

  console.log(
    "Venda:",
    grossAmount
  );

  console.log(
    "Comissão Uranova:",
    platformFee
  );

  console.log(
    "Taxa Stripe:",
    stripeFee
  );

  console.log(
    "Produtor:",
    producerAmount
  );

  console.log(
    "Uranova:",
    platformNet
  );

  console.log(
    "Stripe Connect:",
    sellerStripeAccountId
  );

  // ======================================================
  // 13. REGISTRA PAGAMENTO
  // ======================================================

  const {
    data: insertedPayment,
    error: paymentError,
  } = await admin
    .from("payments")
    .insert({
      user_id:
        sellerId,

      payment_provider_id:
        paymentIntentId,

      status:
        "PAID",

      value:
        grossAmount,

      original_value:
        grossAmount,

      final_value:
        producerAmount,

      platform_fee:
        platformFee,

      platform_fee_percent:
        PLATFORM_FEE_PERCENT,

      stripe_fee:
        stripeFee,

      net_value:
        platformNet,

      customer_name:
        customerName,

      customer_email:
        customerEmail,

      coupon_code:
        null,
    })
    .select("id")
    .maybeSingle();

  // ======================================================
  // 13.1. IDEMPOTÊNCIA
  // ======================================================

  if (
    paymentError
  ) {
    if (
      paymentError.code === "23505"
    ) {
      console.log(
        "Pagamento já registrado por outra execução."
      );

      return;
    }

    console.error(
      "Erro ao criar payment:",
      paymentError
    );

    return;
  }

  if (
    !insertedPayment
  ) {
    console.error(
      "Pagamento não foi criado."
    );

    return;
  }

  console.log(
    "Pagamento salvo com sucesso."
  );

  // ======================================================
  // 14. FINAL
  // ======================================================

  console.log(
    "===================================="
  );

  console.log(
    "PROCESSAMENTO FINANCEIRO FINALIZADO"
  );

  console.log(
    "===================================="
  );

  console.log(
    "Payment Intent:",
    paymentIntentId
  );

  console.log(
    "Venda:",
    grossAmount
  );

  console.log(
    "Uranova:",
    platformFee
  );

  console.log(
    "Stripe:",
    stripeFee
  );

  console.log(
    "Produtor:",
    producerAmount
  );

  console.log(
    "===================================="
  );
}


/**
 * ============================================================
 * RETRY FINANCEIRO
 * ============================================================
 *
 * Usado quando o webhook recebe:
 *
 * - payment_intent.succeeded
 * - charge.succeeded
 * - charge.updated
 *
 * O retry NÃO cria Transfer.
 */
export async function processPaymentIntentSettlement(
  paymentIntentId: string,
  stripeAccountId: string
) {
  try {
    console.log(
      "===================================="
    );

    console.log(
      "STRIPE FINANCIAL RETRY"
    );

    console.log(
      "Payment Intent:",
      paymentIntentId
    );

    console.log(
      "===================================="
    );

    // ======================================================
    // 1. LOCALIZA PAYMENT
    // ======================================================

    const {
      data: existingPayment,
      error: existingPaymentError,
    } = await admin
      .from("payments")
      .select("id")
      .eq(
        "payment_provider_id",
        paymentIntentId
      )
      .maybeSingle();

    if (
      existingPaymentError
    ) {
      console.error(
        "Erro ao verificar pagamento no retry:",
        existingPaymentError
      );

      return;
    }

    if (
      existingPayment
    ) {
      console.log(
        "Payment Intent já possui pagamento registrado."
      );

      return;
    }

    // ======================================================
    // 2. LOCALIZA CHECKOUT SESSION
    // ======================================================

    const sessions =
      await stripe.checkout.sessions.list(
        {
          payment_intent:
            paymentIntentId,

          limit: 1,
        },
        {
          stripeAccount:
            stripeAccountId,
        }
      );

    const session =
      sessions.data[0];

    if (!session) {
      console.log(
        "Checkout Session não encontrada:",
        paymentIntentId
      );

      return;
    }

    // ======================================================
    // 3. METADATA
    // ======================================================

    const productId =
      session.metadata?.product_id;

    const sellerId =
      session.metadata?.seller_id;

    const customerId =
      session.metadata?.customer_id;

    if (
      !productId ||
      !sellerId ||
      !customerId
    ) {
      console.error(
        "Metadata inválida no retry financeiro."
      );

      return;
    }

    // ======================================================
    // 4. CONTA STRIPE
    // ======================================================

    const {
      data: sellerProfile,
      error: sellerProfileError,
    } = await admin
      .from("profiles")
      .select(
        "stripe_account_id"
      )
      .eq(
        "id",
        sellerId
      )
      .single();

    if (
      sellerProfileError ||
      !sellerProfile?.stripe_account_id
    ) {
      console.error(
        "Conta Stripe do produtor não encontrada no retry:",
        sellerProfileError
      );

      return;
    }

    const sellerStripeAccountId =
      sellerProfile.stripe_account_id;

    if (
      sellerStripeAccountId !==
      stripeAccountId
    ) {
      console.error(
        "Inconsistência: conta Stripe do evento diferente da conta Stripe do produtor.",
        {
          eventAccount: stripeAccountId,
          sellerAccount: sellerStripeAccountId,
          sellerId,
        }
      );

      return;
    }

    // ======================================================
    // 5. PRODUTO
    // ======================================================

    const {
      data: product,
      error: productError,
    } = await admin
      .from("products_checkout")
      .select("*")
      .eq(
        "id",
        productId
      )
      .single();

    if (
      productError ||
      !product
    ) {
      console.error(
        "Produto não encontrado no retry:",
        productError
      );

      return;
    }

    // ======================================================
    // 6. PEDIDO
    // ======================================================

    const {
      data: customerProduct,
      error: customerProductError,
    } = await admin
      .from("customer_products")
      .select(
        "order_id"
      )
      .eq(
        "customer_id",
        customerId
      )
      .eq(
        "product_id",
        product.product_id
      )
      .maybeSingle();

    if (
      customerProductError
    ) {
      console.error(
        "Erro ao localizar produto do cliente no retry:",
        customerProductError
      );

      return;
    }

    if (
      !customerProduct?.order_id
    ) {
      console.error(
        "Pedido ainda não encontrado para o produto do cliente."
      );

      return;
    }

    // ======================================================
    // 7. PROCESSA NOVAMENTE
    // ======================================================

    await processFinancialSettlement({
      session,

      sellerId,

      sellerStripeAccountId,

      paymentIntentId,

      orderId:
        customerProduct.order_id,

      customerName:
        session.customer_details?.name ??
        "Cliente Stripe",

      customerEmail:
        session.customer_details?.email ??
        "",
    });

  } catch (error) {
    console.error(
      "ERRO NO RETRY FINANCEIRO:",
      error
    );
  }
}