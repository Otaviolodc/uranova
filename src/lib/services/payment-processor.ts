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
 * Responsabilidades:
 *
 * 1. Validar pagamento
 * 2. Encontrar produto
 * 3. Criar pedido
 * 4. Liberar produto para cliente
 * 5. Tentar processar financeiro
 *
 * IMPORTANTE:
 *
 * A liberação do produto NÃO depende da Balance Transaction.
 *
 * A taxa real da Stripe será obtida separadamente.
 *
 * IDEMPOTÊNCIA:
 *
 * O processamento financeiro é protegido pelo
 * payment_provider_id (Payment Intent).
 *
 * O banco possui índice UNIQUE nesse campo.
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
      console.error("Metadata inválida no checkout.");
      return;
    }

    // ======================================================
    // 2. CONTA STRIPE DO PRODUTOR
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
    // 3. PAYMENT INTENT
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
    // 4. LOG
    // ======================================================

    console.log("====================================");
    console.log("PAYMENT PROCESSOR");
    console.log("====================================");

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

    console.log(
      "Metadata:",
      session.metadata
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
    // 6. BUSCA PRODUTO
    // ======================================================

    const {
      data: product,
      error: productError,
    } = await admin
      .from("products_checkout")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
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
    // 8. CLIENTE / PEDIDO
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

    let orderId: string | null =
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

      orderId = order.id;

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
    // 12. TENTA PROCESSAR FINANCEIRO
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
 * Essa função pode ser executada novamente quando a Stripe
 * disponibilizar a Balance Transaction.
 *
 * O produto do cliente NÃO depende dessa etapa.
 *
 * IDEMPOTÊNCIA:
 *
 * O Payment Intent é a chave única da operação financeira.
 *
 * Mesmo que a Stripe envie vários eventos, somente uma
 * execução poderá registrar o pagamento em `payments`.
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
  // 1. VERIFICA PAGAMENTO FINANCEIRO JÁ REGISTRADO
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
      "Pagamento financeiro já processado. Encerrando execução duplicada."
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
      "Charge ainda não disponível. Financeiro ficará pendente."
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
      "Produto já foi liberado. Financeiro será processado posteriormente."
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
  // 8. PRODUTOR
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
      "Valor líquido do produtor inválido:",
      producerAmount
    );

    return;
  }

  const calculatedTotal =
    Math.round(
      (
        producerAmount +
        platformFee +
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

  // ======================================================
  // 12. TRANSFER PARA PRODUTOR
  // ======================================================
  //
  // SEPARATE CHARGES AND TRANSFERS
  //
  // A cobrança permanece na Uranova.
  //
  // O produtor recebe somente:
  //
  // Venda
  // - Comissão Uranova
  // - Taxa REAL Stripe
  // = Produtor
  //
  // source_transaction garante que a transferência
  // fique vinculada à cobrança original.
  //
  // A idempotencyKey garante que chamadas repetidas
  // para o mesmo Payment Intent não criem uma nova
  // transferência.
  //

  const transferAmount =
    Math.round(
      producerAmount *
        100
    );

  if (
    transferAmount <= 0
  ) {
    console.error(
      "Valor de transferência inválido:",
      transferAmount
    );

    return;
  }

  let producerTransfer:
    Stripe.Transfer;

  try {
    producerTransfer =
      await stripe.transfers.create(
        {
          amount:
            transferAmount,

          currency:
            "brl",

          destination:
            sellerStripeAccountId,

          source_transaction:
            charge.id,

          metadata: {
            payment_intent_id:
              paymentIntentId,

            session_id:
              session.id,

            product_id:
              product.id,

            seller_id:
              sellerId,

            customer_id:
              customerId,

            gross_amount:
              String(
                grossAmount
              ),

            stripe_fee:
              String(
                stripeFee
              ),

            platform_fee:
              String(
                platformFee
              ),

            producer_amount:
              String(
                producerAmount
              ),
          },
        },
        {
          idempotencyKey:
            `uranova-transfer-${paymentIntentId}`,
        }
      );

    console.log(
      "Transfer criada:",
      producerTransfer.id
    );
  } catch (error) {
    console.error(
      "Erro ao criar transferência para produtor:",
      error
    );

    return;
  }

  // ======================================================
  // 13. REGISTRA PAGAMENTO
  // ======================================================
  //
  // IMPORTANTE:
  //
  // A tabela payments possui UNIQUE em:
  //
  // payment_provider_id
  //
  // Portanto, se duas execuções chegarem aqui
  // simultaneamente, somente uma poderá inserir.
  //
  // O erro PostgreSQL 23505 significa que outra
  // execução já registrou esse pagamento.
  //

  const {
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
    });

  if (
    paymentError
  ) {
    // ====================================================
    // DUPLICAÇÃO CONTROLADA
    // ====================================================

    if (
      paymentError.code ===
      "23505"
    ) {
      console.log(
        "Pagamento já registrado por outra execução."
      );

      console.log(
        "Payment Intent duplicado:",
        paymentIntentId
      );

      console.log(
        "Processamento duplicado encerrado com segurança."
      );

      return;
    }

    // ====================================================
    // OUTRO ERRO
    // ====================================================

    console.error(
      "Erro ao criar payment:",
      paymentError
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
    "Transfer:",
    producerTransfer.id
  );

  console.log(
    "Payment Intent:",
    paymentIntentId
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
 * Essa função será usada pelo webhook quando receber:
 *
 * - charge.succeeded
 * - charge.updated
 *
 * A Stripe permite localizar a Checkout Session usando
 * o Payment Intent.
 *
 * Antes de executar qualquer processamento pesado,
 * verificamos se esse Payment Intent já foi processado.
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
    // 0. VERIFICA SE JÁ FOI PROCESSADO
    // ======================================================
    //
    // Isso evita que charge.updated ou outros eventos
    // posteriores façam consultas e processamento
    // financeiro desnecessário.
    //

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
    // 1. LOCALIZA CHECKOUT SESSION
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
    // 2. METADATA
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
    // 3. CONTA STRIPE DO PRODUTOR
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
    // 4. PRODUTO
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
    // 5. PEDIDO
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
    // 6. TENTA NOVAMENTE O FINANCEIRO
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