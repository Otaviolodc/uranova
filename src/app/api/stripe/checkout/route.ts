import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";

interface CheckoutRequest {
  checkoutSlug: string;
}

export async function POST(req: Request) {
  try {
    const body: CheckoutRequest = await req.json();

    if (!body.checkoutSlug) {
      return NextResponse.json(
        {
          error: "Checkout slug obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Usuário não autenticado.",
        },
        {
          status: 401,
        }
      );
    }

    // ======================================================
    // BUSCA O PRODUTO
    // ======================================================

    const { data: product, error } = await supabase
      .from("products_checkout")
      .select("*")
      .eq("checkout_slug", body.checkoutSlug)
      .maybeSingle();

    if (error) {
      console.error(
        "Erro ao buscar produto:",
        error
      );

      return NextResponse.json(
        {
          error: "Erro ao buscar produto.",
        },
        {
          status: 500,
        }
      );
    }

    if (!product) {
      return NextResponse.json(
        {
          error: "Produto não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      !product.is_active ||
      product.status !== "active"
    ) {
      return NextResponse.json(
        {
          error: "Produto indisponível.",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // CONTA STRIPE DO PRODUTOR
    // ======================================================

    const {
      data: sellerProfile,
      error: sellerProfileError,
    } = await admin
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", product.user_id)
      .single();

    if (
      sellerProfileError ||
      !sellerProfile?.stripe_account_id
    ) {
      return NextResponse.json(
        {
          error:
            "O produtor ainda não conectou sua conta Stripe.",
        },
        {
          status: 400,
        }
      );
    }

    const sellerStripeAccountId =
      sellerProfile.stripe_account_id;

    // ======================================================
    // URLS
    // ======================================================

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_SITE_URL!;

    // ======================================================
    // VALOR DA VENDA
    // ======================================================

    const amount = Math.round(
      Number(product.price) * 100
    );

    if (amount <= 0) {
      return NextResponse.json(
        {
          error: "Valor do produto inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // COMISSÃO COMERCIAL DA URANOVA
    //
    // A Uranova tem direito a 10% da venda.
    //
    // IMPORTANTE:
    // A tarifa real da Stripe NÃO é calculada aqui.
    //
    // Ela será obtida posteriormente através da
    // Balance Transaction no payment-processor.
    // ======================================================

    const platformFee = Math.round(
      amount * 0.10
    );

    const sellerAmount =
      amount - platformFee;

    // ======================================================
    // STRIPE CHECKOUT
    //
    // SEPARATE CHARGES AND TRANSFERS
    //
    // A cobrança inteira acontece na conta da Uranova.
    //
    // NÃO usamos:
    //
    // payment_intent_data.transfer_data
    //
    // A transferência para o produtor será criada
    // posteriormente pelo payment-processor.
    // ======================================================

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        success_url:
          `${baseUrl}/checkout/success` +
          `?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${baseUrl}/checkout/${product.checkout_slug}`,

        client_reference_id: product.id,

        metadata: {
          product_id: product.id,

          seller_id: product.user_id,

          customer_id: user.id,

          checkout_slug:
            product.checkout_slug,

          platform_fee:
            String(platformFee),

          seller_amount:
            String(sellerAmount),

          seller_stripe_account_id:
            sellerStripeAccountId,
        },

        payment_intent_data: {
          metadata: {
            product_id: product.id,

            seller_id: product.user_id,

            customer_id: user.id,

            checkout_slug:
              product.checkout_slug,

            seller_stripe_account_id:
              sellerStripeAccountId,

            platform_fee:
              String(platformFee),

            seller_amount:
              String(sellerAmount),
          },

          transfer_group:
            `uranova_order_${product.id}`,
        },

        line_items: [
          {
            quantity: 1,

            price_data: {
              currency: "brl",

              unit_amount: amount,

              product_data: {
                name: product.title,

                description:
                  product.description ??
                  undefined,

                images: product.image_url
                  ? [product.image_url]
                  : [],
              },
            },
          },
        ],
      });

    // ======================================================
    // RESPOSTA
    // ======================================================

    return NextResponse.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.error(
      "STRIPE CHECKOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro interno.",
      },
      {
        status: 500,
      }
    );
  }
}