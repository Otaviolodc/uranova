import { NextResponse } from "next/server";
import { stripe, assertStripeLive } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";
import { requireFinanceUser } from "@/lib/finance/access";
import { platformFeeCents, priceToCents } from "@/lib/finance/money";
import { assertDirectChargeAccount } from "@/lib/services/payment-processor";

export async function POST(req: Request) {
  try {
    const user = await requireFinanceUser();
    assertStripeLive();
    const { checkoutSlug } = await req.json();
    if (typeof checkoutSlug !== "string" || !checkoutSlug || checkoutSlug.length > 500) {
      return NextResponse.json({ error: "Checkout inválido." }, { status: 400 });
    }
    const { data: product, error } = await admin.from("products_checkout").select("*")
      .eq("checkout_slug", checkoutSlug).single();
    if (error || !product?.product_id || !product.is_active || product.status !== "active") {
      return NextResponse.json({ error: "Produto indisponível." }, { status: 404 });
    }
    const { data: profile, error: profileError } = await admin.from("profiles").select("stripe_account_id")
      .eq("id", product.user_id).single();
    if (profileError || !profile?.stripe_account_id) {
      return NextResponse.json({ error: "Produtor ainda não conectou a Stripe." }, { status: 409 });
    }
    await assertDirectChargeAccount(profile.stripe_account_id);
    const amount = priceToCents(product.price), fee = platformFeeCents(amount);
    if (amount <= 0 || fee <= 0) throw new Error("Invalid price");
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
    if (!base || new URL(base).protocol !== "https:") throw new Error("HTTPS site URL required");
    const metadata = { product_id: product.id, seller_id: product.user_id, customer_id: user.id,
      seller_stripe_account_id: profile.stripe_account_id, finance_version: "1" };
    const session = await stripe.checkout.sessions.create({
      mode: "payment", client_reference_id: product.id, metadata, customer_email: user.email,
      success_url: base + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: base + "/checkout/" + encodeURIComponent(product.checkout_slug),
      payment_intent_data: { application_fee_amount: fee, metadata },
      line_items: [{ quantity: 1, price_data: { currency: "brl", unit_amount: amount,
        product_data: { name: product.title } } }],
    }, { stripeAccount: profile.stripe_account_id });
    if (!session.livemode || !session.url) throw new Error("Invalid Stripe Live checkout");
    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Checkout failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento. Verifique a configuração Stripe com o suporte." },
      { status: error instanceof Error && error.message === "UNAUTHENTICATED" ? 401 : 503 });
  }
}
