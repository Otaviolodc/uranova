import { integrationUnavailable } from "@/lib/security/staging-policy";
import { rateLimit } from "@/lib/security/rate-limit";
import { safeError, sameOrigin,jsonBody } from "@/lib/security/request";
import { exactKeys } from "@/lib/security/validation";
import { NextResponse } from "next/server";
import { stripe, assertStripeLive } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";
import { requireFinanceUser } from "@/lib/finance/access";
import { platformFeeCents, priceToCents } from "@/lib/finance/money";
import { assertDirectChargeAccount } from "@/lib/services/payment-processor";
import { logCheckoutFailure, type CheckoutStage } from "@/lib/security/checkout-observability";

export async function POST(req: Request) {
  const unavailable = integrationUnavailable();
  if (unavailable) {
    logCheckoutFailure("INTEGRATION_CONFIG", unavailable.status, undefined, "CONFIGURATION_ERROR");
    return unavailable;
  }
  let stage: CheckoutStage = "ORIGIN";
  let stripeRequestId: unknown;

  try {
    sameOrigin(req);
    stage = "AUTH";
    const user = await requireFinanceUser();
    stage = "RATE_LIMIT";
    await rateLimit("checkout", user.id);
    stage = "STRIPE_CONFIG";
    assertStripeLive();
    stage = "REQUEST_VALIDATION";
    const body=await jsonBody(req); exactKeys(body,["checkoutSlug"]);
    const { checkoutSlug } = body;
    if (typeof checkoutSlug !== "string" || !checkoutSlug || checkoutSlug.length > 500) {
      logCheckoutFailure(stage, 400);
      return NextResponse.json({ error: "Checkout inválido." }, { status: 400 });
    }
    stage = "CHECKOUT_READ";
    const { data: product, error } = await admin.from("products_checkout").select("*")
      .eq("checkout_slug", checkoutSlug).single();
    if (error || !product?.product_id || !product.is_active || product.status !== "active") {
      logCheckoutFailure(stage, 404, undefined, error && error.code !== "PGRST116" ? "DEPENDENCY_ERROR" : "EXPECTED_REJECTION");
      return NextResponse.json({ error: "Produto indisponível." }, { status: 404 });
    }
    stage = "PRODUCER_READ";
    const { data: profile, error: profileError } = await admin.from("profiles").select("stripe_account_id")
      .eq("id", product.user_id).single();
    if (profileError || !profile?.stripe_account_id) {
      logCheckoutFailure(stage, 409, undefined, profileError && profileError.code !== "PGRST116" ? "DEPENDENCY_ERROR" : "EXPECTED_REJECTION");
      return NextResponse.json({ error: "Produtor ainda não conectou a Stripe." }, { status: 409 });
    }
    stage = "CONNECT_VALIDATION";
    await assertDirectChargeAccount(profile.stripe_account_id);
    stage = "PRICE_VALIDATION";
    const amount = priceToCents(product.price), fee = platformFeeCents(amount);
    if (amount <= 0 || fee <= 0) throw new Error("Invalid price");
    stage = "URL_VALIDATION";
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
    if (!base || new URL(base).protocol !== "https:") throw new Error("HTTPS site URL required");
    const metadata = { product_id: product.id, seller_id: product.user_id, customer_id: user.id,
      seller_stripe_account_id: profile.stripe_account_id, finance_version: "1" };
    stage = "SESSION_CREATE";
    const session = await stripe.checkout.sessions.create({
      mode: "payment", client_reference_id: product.id, metadata, customer_email: user.email,
      success_url: base + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: base + "/checkout/" + encodeURIComponent(product.checkout_slug),
      payment_intent_data: { application_fee_amount: fee, metadata },
      line_items: [{ quantity: 1, price_data: { currency: "brl", unit_amount: amount,
        product_data: { name: product.title } } }],
    }, { stripeAccount: profile.stripe_account_id });
    stage = "SESSION_URL_VALIDATION";
    stripeRequestId = session.lastResponse?.requestId;
    if (!session.livemode || !session.url) throw new Error("Invalid Stripe Live checkout");
    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    const response = safeError(error);
    logCheckoutFailure(stage, response.status, error, undefined, stripeRequestId);
    return response;
  }
}
