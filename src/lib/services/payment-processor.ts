import { processSale } from "@/lib/services/financial";
import { stripe } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";
import Stripe from "stripe";

interface ProcessCheckoutCompletedParams {
  session: Stripe.Checkout.Session;
}

export async function processCheckoutCompleted({
  session,
}: ProcessCheckoutCompletedParams) {

  const productId = session.metadata?.product_id;

  const sellerId = session.metadata?.seller_id;

  const customerId = session.metadata?.customer_id;

  if (
    !productId ||
    !sellerId ||
    !customerId
  ) {
    console.log("Metadata inválida.");

    return;
  }

  // Evita processar o mesmo webhook mais de uma vez
const paymentIntent = String(session.payment_intent);

const {
  data: existingPayment,
  error: existingPaymentError,
} = await admin
  .from("payments")
  .select("id")
  .eq("payment_provider_id", paymentIntent)
  .maybeSingle();

if (existingPaymentError) {
  console.error("Erro ao verificar pagamento existente:");
  console.error(existingPaymentError);
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

  console.log(
    "Payment Status:",
    session.payment_status
  );

  console.log(
    "Customer:",
    session.customer
  );

  console.log(
    "Payment Intent:",
    session.payment_intent
  );

  console.log(
    "Client Reference:",
    session.client_reference_id
  );

  console.log(
    "Metadata:",
    session.metadata
  );

  console.log("====================================");

  const { data: product, error } = await admin
    .from("products_checkout")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !product) {
    console.log("Produto não encontrado.");

    return;
  }

  console.log("Produto encontrado:");
  console.log(product.title);

  const { error: paymentError } = await admin
  .from("payments")
  .insert({
    user_id: sellerId,
    payment_provider_id: String(session.payment_intent),
    status: "PAID",
    value: product.price,
    original_value: product.price,
    final_value: product.price,
    customer_name: "Stripe Customer",
    customer_email: "",
    coupon_code: null,
  });

if (paymentError) {
  console.error("Erro ao criar payment:");
  console.error(paymentError);

  return;
}

console.log("Pagamento salvo com sucesso.");

const { data: order, error: orderError } = await admin
  .from("orders")
  .insert({
    user_id: sellerId,

    product_id: product.product_id,

    amount: Number(product.price),

    customer_name: "Stripe Customer",

    customer_email:
      session.customer_details?.email ?? "",

    status: "PAID",
  })
  .select()
  .single();

if (orderError) {
  console.error("Erro ao criar pedido:");
  console.error(orderError);

  return;
}

console.log("Pedido criado com sucesso.");
console.log(order.id);

const { error: customerProductError } = await admin
  .from("customer_products")
  .insert({
    customer_id: customerId,

    product_id: product.product_id,

    order_id: order.id,

    status: "active",
  });

if (customerProductError) {
  console.error("Erro ao liberar produto:");
  console.error(customerProductError);

  return;
}

console.log("Produto liberado para o cliente.");

const financialResult = await processSale({
  userId: sellerId,
  orderId: order.id,
  amount: Number(product.price),
  description: `Venda: ${product.title}`,
});

console.log(financialResult.message);

}