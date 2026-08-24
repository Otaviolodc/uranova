import { processSale } from "@/lib/services/financial";
import { stripe } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";
import Stripe from "stripe";

interface ProcessCheckoutCompletedParams {
  session: Stripe.Checkout.Session;
}

const PLATFORM_FEE_PERCENT = 10;

export async function processCheckoutCompleted({
  session,
}: ProcessCheckoutCompletedParams) {

  const productId = session.metadata?.product_id;
  const sellerId = session.metadata?.seller_id;
  const customerId = session.metadata?.customer_id;

  if (!productId || !sellerId || !customerId) {
    console.log("Metadata inválida.");
    return;
  }

  // ======================================================
  // PAYMENT INTENT
  // ======================================================

  const paymentIntentId = session.payment_intent
    ? String(session.payment_intent)
    : null;

  if (!paymentIntentId) {
    console.error("Payment Intent não encontrado.");
    return;
  }

  // ======================================================
  // EVITA PROCESSAR O MESMO WEBHOOK DUAS VEZES
  // ======================================================

  const {
    data: existingPayment,
    error: existingPaymentError,
  } = await admin
    .from("payments")
    .select("id")
    .eq("payment_provider_id", paymentIntentId)
    .maybeSingle();

  if (existingPaymentError) {
    console.error(
      "Erro ao verificar pagamento existente:",
      existingPaymentError
    );

    return;
  }

  if (existingPayment) {
    console.log("Pagamento já processado anteriormente.");
    return;
  }

  console.log("====================================");
  console.log("PAYMENT PROCESSOR");
  console.log("====================================");

  console.log("Session ID:", session.id);
  console.log("Payment Status:", session.payment_status);
  console.log("Payment Intent:", paymentIntentId);
  console.log("Client Reference:", session.client_reference_id);
  console.log("Metadata:", session.metadata);

  // ======================================================
  // BUSCA O PRODUTO
  // ======================================================

  const { data: product, error: productError } = await admin
    .from("products_checkout")
    .select("*")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    console.error("Produto não encontrado:", productError);
    return;
  }

  console.log("Produto encontrado:", product.title);

  // ======================================================
  // BUSCA O PAYMENT INTENT NA STRIPE
  // ======================================================

  const paymentIntent = await stripe.paymentIntents.retrieve(
    paymentIntentId,
    {
      expand: ["latest_charge.balance_transaction"],
    }
  );

  // ======================================================
  // VALOR BRUTO REAL DA VENDA
  // ======================================================

  const grossAmount =
    session.amount_total !== null
      ? Number(session.amount_total) / 100
      : Number(paymentIntent.amount_received) / 100;

  if (grossAmount <= 0) {
    console.error("Valor bruto inválido:", grossAmount);
    return;
  }

  // ======================================================
  // BUSCA A TAXA REAL DA STRIPE
  // ======================================================

  let stripeFee = 0;

  const latestCharge = paymentIntent.latest_charge;

  if (latestCharge) {

    const charge =
      typeof latestCharge === "string"
        ? await stripe.charges.retrieve(latestCharge)
        : latestCharge;

    const balanceTransaction =
      typeof charge.balance_transaction === "string"
        ? await stripe.balanceTransactions.retrieve(
            charge.balance_transaction
          )
        : charge.balance_transaction;

    if (!balanceTransaction) {
      console.error(
        "Balance Transaction não encontrada para o pagamento."
      );

      return;
    }

    stripeFee = Number(balanceTransaction.fee) / 100;

    console.log("Stripe fee real:", stripeFee);
    console.log("Stripe net:", Number(balanceTransaction.net) / 100);
  }

  // ======================================================
  // COMISSÃO URANOVA
  // ======================================================

  const platformFee =
    grossAmount * (PLATFORM_FEE_PERCENT / 100);

  // ======================================================
  // VALOR LÍQUIDO DO PRODUTOR
  // ======================================================

  const netValue =
    grossAmount -
    platformFee -
    stripeFee;

  if (netValue < 0) {
    console.error(
      "Valor líquido inválido:",
      netValue
    );

    return;
  }

  console.log("====================================");
  console.log("FINANCIAL CALCULATION");
  console.log("====================================");

  console.log("Gross:", grossAmount);
  console.log("Uranova fee:", platformFee);
  console.log("Uranova fee %:", PLATFORM_FEE_PERCENT);
  console.log("Stripe fee:", stripeFee);
  console.log("Producer net:", netValue);

  console.log("====================================");

  // ======================================================
  // REGISTRA PAGAMENTO
  // ======================================================

  const { error: paymentError } = await admin
    .from("payments")
    .insert({
      user_id: sellerId,

      payment_provider_id: paymentIntentId,

      status: "PAID",

      // Valor bruto da venda
      value: grossAmount,

      original_value: grossAmount,

      // Valor líquido do produtor
      final_value: netValue,

      // Nova estrutura financeira
      platform_fee: platformFee,

      platform_fee_percent: PLATFORM_FEE_PERCENT,

      stripe_fee: stripeFee,

      net_value: netValue,

      customer_name: "Stripe Customer",

      customer_email:
        session.customer_details?.email ?? "",

      coupon_code: null,
    });

  if (paymentError) {
    console.error(
      "Erro ao criar payment:",
      paymentError
    );

    return;
  }

  console.log("Pagamento salvo com sucesso.");

  // ======================================================
  // CRIA PEDIDO
  // ======================================================

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: sellerId,

      product_id: product.product_id,

      // Pedido continua registrando o valor bruto
      amount: grossAmount,

      customer_name: "Stripe Customer",

      customer_email:
        session.customer_details?.email ?? "",

      status: "PAID",
    })
    .select()
    .single();

  if (orderError) {
    console.error(
      "Erro ao criar pedido:",
      orderError
    );

    return;
  }

  console.log("Pedido criado com sucesso.");
  console.log("Order ID:", order.id);

  // ======================================================
  // LIBERA PRODUTO PARA CLIENTE
  // ======================================================

  const { error: customerProductError } = await admin
    .from("customer_products")
    .insert({
      customer_id: customerId,

      product_id: product.product_id,

      order_id: order.id,

      status: "active",
    });

  if (customerProductError) {
    console.error(
      "Erro ao liberar produto:",
      customerProductError
    );

    return;
  }

  console.log("Produto liberado para o cliente.");

  // ======================================================
  // FINANCEIRO DO PRODUTOR
  // ======================================================

  const financialResult = await processSale({
    userId: sellerId,

    orderId: order.id,

    // IMPORTANTE:
    // produtor recebe somente o líquido
    amount: netValue,

    description: `Venda: ${product.title}`,
  });

  console.log(financialResult.message);

  console.log("====================================");
  console.log("PROCESSAMENTO FINALIZADO");
  console.log("====================================");
}