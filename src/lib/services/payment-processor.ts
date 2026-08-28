import { processSale } from "@/lib/services/financial";
import { stripe } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";
import Stripe from "stripe";

interface ProcessCheckoutCompletedParams {
  session: Stripe.Checkout.Session;
}

const PLATFORM_FEE_PERCENT = 10;

/**
 * ============================================================
 * PROCESSA CHECKOUT CONCLUÍDO
 * ============================================================
 *
 * Fluxo:
 *
 * Cliente paga
 * ↓
 * Stripe processa pagamento
 * ↓
 * 10% = comissão Uranova
 * ↓
 * restante = saldo Stripe Connect do produtor
 * ↓
 * Stripe controla payout do produtor
 *
 * IMPORTANTE:
 *
 * Este arquivo NÃO cria Transfer.
 *
 * A transferência para o produtor é responsabilidade
 * da configuração do Checkout através do Stripe Connect.
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
      "Seller Stripe Account:",
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
      "Produto encontrado:",
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
      .select(
        "id, order_id"
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
    // 10. CRIA PEDIDO SE NECESSÁRIO
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
        "Pedido criado com sucesso."
      );

      console.log(
        "Order ID:",
        order.id
      );
    } else {
      console.log(
        "Pedido já existente:",
        orderId
      );
    }

    // ======================================================
    // 11. LIBERA PRODUTO PARA CLIENTE
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
      customerId,
      product,
      paymentIntentId,
      orderId,
      customerName,
      customerEmail,
    });

    console.log(
      "Checkout processado."
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
 * IMPORTANTE:
 *
 * NÃO cria Transfer.
 *
 * A Stripe já recebe:
 *
 * application_fee_amount = 10%
 *
 * transfer_data.destination =
 * conta Stripe Connect do produtor
 *
 * Portanto:
 *
 * Venda
 * - 10% Uranova
 * = Produtor
 *
 * A taxa Stripe é uma despesa da operação da plataforma.
 */
async function processFinancialSettlement({
  session,
  sellerId,
  sellerStripeAccountId,
  customerId,
  product,
  paymentIntentId,
  orderId,
  customerName,
  customerEmail,
}: {
  session: Stripe.Checkout.Session;
  sellerId: string;
  sellerStripeAccountId: string;
  customerId: string;
  product: any;
  paymentIntentId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
}) {
  // ======================================================
  // 1. VERIFICA SE JÁ FOI PROCESSADO
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

    console.log(
      "Payment Intent já registrado:",
      paymentIntentId
    );

    return;
  }

  // ======================================================
  // 2. PAYMENT INTENT
  // ======================================================

  const paymentIntent =
    await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: [
          "latest_charge.balance_transaction",
        ],
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

    console.log(
      "Financeiro ficará pendente para processamento posterior."
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
          charge.balance_transaction
        )
      : charge.balance_transaction;

  if (
    !balanceTransaction
  ) {
    console.log(
      "Balance Transaction ainda não disponível."
    );

    console.log(
      "Financeiro será processado posteriormente."
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

  const stripeNet =
    Number(
      balanceTransaction.net
    ) / 100;

  if (
    !Number.isFinite(
      stripeFee
    ) ||
    stripeFee < 0
  ) {
    console.error(
      "Tarifa Stripe inválida:",
      stripeFee
    );

    return;
  }

  console.log(
    "Stripe fee real:",
    stripeFee
  );

  console.log(
    "Stripe net:",
    stripeNet
  );

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
  // 8. VALOR DO PRODUTOR
  // ======================================================

  const producerAmount =
    Math.round(
      (
        grossAmount -
        platformFee
      ) *
        100
    ) / 100;

  // ======================================================
  // 9. URANOVA LÍQUIDA
  // ======================================================

  const platformNet =
    Math.round(
      (
        platformFee -
        stripeFee
      ) *
        100
    ) / 100;

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

  const calculatedTotal =
    Math.round(
      (
        producerAmount +
        platformFee
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
      stripeFee,
      platformFee,
      producerAmount,
    });

    return;
  }

  // ======================================================
  // 11. LOG FINANCEIRO
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
    "Stripe Fee:",
    stripeFee
  );

  console.log(
    "Uranova 10%:",
    platformFee
  );

  console.log(
    "Produtor:",
    producerAmount
  );

  console.log(
    "Uranova líquida:",
    platformNet
  );

  console.log(
    "Stripe Connect:",
    sellerStripeAccountId
  );

  // ======================================================
  // 12. NÃO CRIA TRANSFER
  // ======================================================

  console.log(
    "Transferência manual desativada."
  );

  console.log(
    "Produtor recebe pelo Stripe Connect."
  );

  // ======================================================
  // 13. REGISTRA PAGAMENTO
  // ======================================================
  //
  // A coluna payment_provider_id possui UNIQUE.
  //
  // Mesmo que dois webhooks cheguem simultaneamente,
  // o banco impedirá duplicação.
  //
  // Se ocorrer 23505, significa que outra execução
  // conseguiu registrar primeiro.
  //
  // Nesse caso NÃO devemos executar processSale(),
  // pois o financeiro já foi registrado pela outra execução.
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
  // 13.1. PAGAMENTO JÁ INSERIDO POR OUTRA EXECUÇÃO
  // ======================================================

  if (
    paymentError
  ) {
    if (
      paymentError.code === "23505"
    ) {
      console.log(
        "Pagamento já foi registrado por outra execução."
      );

      console.log(
        "Payment Intent duplicado ignorado:",
        paymentIntentId
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
  // 14. FINANCEIRO DO PRODUTOR
  // ======================================================

  const financialResult =
    await processSale({
      userId:
        sellerId,

      orderId:
        orderId,

      amount:
        producerAmount,

      description:
        `Venda: ${product.title}`,
    });

  console.log(
    financialResult.message
  );

  // ======================================================
  // 15. FINAL
  // ======================================================

  console.log(
    "===================================="
  );

  console.log(
    "PROCESSAMENTO FINANCEIRO FINALIZADO"
  );

  console.log(
    "Payment Intent:",
    paymentIntentId
  );

  console.log(
    "Valor bruto:",
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
    "===================================="
  );
}


/**
 * ============================================================
 * PROCESSA UM PAYMENT INTENT NOVAMENTE
 * ============================================================
 *
 * Usado pelo webhook para:
 *
 * - payment_intent.succeeded
 * - charge.succeeded
 * - charge.updated
 *
 * O retry NÃO cria transferência.
 */
export async function processPaymentIntentSettlement(
  paymentIntentId: string
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
    // 1. VERIFICA SE JÁ FOI PROCESSADO
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

      console.log(
        "Retry financeiro ignorado:",
        paymentIntentId
      );

      return;
    }

    // ======================================================
    // 2. LOCALIZA CHECKOUT SESSION
    // ======================================================

    const sessions =
      await stripe.checkout.sessions.list({
        payment_intent:
          paymentIntentId,

        limit: 1,
      });

    const session =
      sessions.data[0];

    if (!session) {
      console.log(
        "Checkout Session não encontrada para Payment Intent:",
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
    // 4. CONTA STRIPE DO PRODUTOR
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
        "Pedido não encontrado para o produto do cliente."
      );

      return;
    }

    // ======================================================
    // 7. PROCESSA FINANCEIRO NOVAMENTE
    // ======================================================

    await processFinancialSettlement({
      session,

      sellerId,

      sellerStripeAccountId:
        sellerProfile.stripe_account_id,

      customerId,

      product,

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