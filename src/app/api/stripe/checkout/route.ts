import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";

interface CheckoutRequest {
  checkoutSlug: string;
}

const PLATFORM_FEE_PERCENT = 10;

export async function POST(req: Request) {
  try {
    // ======================================================
    // 1. BODY
    // ======================================================

    const body: CheckoutRequest = await req.json();

    if (
      !body.checkoutSlug ||
      typeof body.checkoutSlug !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Checkout slug obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    // Evita receber uma string gigantesca
    // desnecessariamente no endpoint.
    if (body.checkoutSlug.length > 500) {
      return NextResponse.json(
        {
          error: "Checkout slug inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // 2. AUTENTICAÇÃO
    // ======================================================

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
    // 3. BUSCA O PRODUTO
    // ======================================================

    const {
      data: product,
      error: productError,
    } = await supabase
      .from("products_checkout")
      .select("*")
      .eq(
        "checkout_slug",
        body.checkoutSlug
      )
      .maybeSingle();

    if (productError) {
      console.error(
        "Erro ao buscar produto:",
        productError
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

    // ======================================================
    // 4. STATUS DO PRODUTO
    // ======================================================

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
    // 5. VALIDA PRODUTOR
    // ======================================================

    if (!product.user_id) {
      console.error(
        "Produto sem produtor associado:",
        product.id
      );

      return NextResponse.json(
        {
          error: "Produto inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // 6. CONTA STRIPE CONNECT
    // ======================================================

    const {
      data: sellerProfile,
      error: sellerProfileError,
    } = await admin
      .from("profiles")
      .select("stripe_account_id")
      .eq(
        "id",
        product.user_id
      )
      .single();

    if (
      sellerProfileError ||
      !sellerProfile?.stripe_account_id
    ) {
      console.error(
        "Conta Stripe do produtor não encontrada:",
        sellerProfileError
      );

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
    // 7. URLS
    // ======================================================

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_SITE_URL;

    if (!baseUrl) {
      console.error(
        "NEXT_PUBLIC_SITE_URL não configurada."
      );

      return NextResponse.json(
        {
          error:
            "URL da plataforma não configurada.",
        },
        {
          status: 500,
        }
      );
    }

    // ======================================================
    // 8. CODIFICA SLUG
    // ======================================================
    //
    // Importante:
    //
    // O slug pode conter:
    //
    // 📦
    // —
    // ç
    // ã
    //
    // O navegador consegue trabalhar com isso,
    // mas o Stripe exige URL percent-encoded.
    //
    // Exemplo:
    //
    // 📦-teste-fase-1-—-segurança
    //
    // vira:
    //
    // %F0%9F%93%A6-teste-fase-1-%E2%80%94-seguran%C3%A7a
    //
    // ======================================================

    const encodedCheckoutSlug =
      encodeURIComponent(
        product.checkout_slug
      );

    // ======================================================
    // 9. PREÇO
    // ======================================================

    const productPrice =
      Number(product.price);

    if (
      !Number.isFinite(productPrice) ||
      productPrice <= 0
    ) {
      console.error(
        "Preço do produto inválido:",
        product.price
      );

      return NextResponse.json(
        {
          error:
            "Valor do produto inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // Stripe trabalha com centavos.
    const amount =
      Math.round(
        productPrice * 100
      );

    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0
    ) {
      console.error(
        "Valor Stripe inválido:",
        {
          productPrice,
          amount,
        }
      );

      return NextResponse.json(
        {
          error:
            "Valor do produto inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // 10. COMISSÃO URANOVA
    // ======================================================

    const platformFee =
      Math.round(
        amount *
          (PLATFORM_FEE_PERCENT / 100)
      );

    const sellerAmount =
      amount - platformFee;

    if (
      !Number.isSafeInteger(
        platformFee
      ) ||
      platformFee <= 0
    ) {
      console.error(
        "Comissão Uranova inválida:",
        platformFee
      );

      return NextResponse.json(
        {
          error:
            "Erro no cálculo da comissão.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !Number.isSafeInteger(
        sellerAmount
      ) ||
      sellerAmount < 0
    ) {
      console.error(
        "Valor do produtor inválido:",
        sellerAmount
      );

      return NextResponse.json(
        {
          error:
            "Erro no cálculo do valor do produtor.",
        },
        {
          status: 500,
        }
      );
    }

    // ======================================================
    // 11. LOG
    // ======================================================

    console.log(
      "===================================="
    );

    console.log(
      "URANOVA STRIPE CHECKOUT"
    );

    console.log(
      "===================================="
    );

    console.log(
      "Produto:",
      product.title
    );

    console.log(
      "Produto ID:",
      product.id
    );

    console.log(
      "Seller ID:",
      product.user_id
    );

    console.log(
      "Stripe Connect:",
      sellerStripeAccountId
    );

    console.log(
      "Valor:",
      productPrice
    );

    console.log(
      "Valor em centavos:",
      amount
    );

    console.log(
      "Comissão Uranova:",
      platformFee
    );

    console.log(
      "Valor produtor:",
      sellerAmount
    );

    // ======================================================
    // 12. STRIPE CHECKOUT
    // ======================================================

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        // ==================================================
        // URL DE SUCESSO
        // ==================================================

        success_url:
          `${baseUrl}/checkout/success` +
          `?session_id={CHECKOUT_SESSION_ID}`,

        // ==================================================
        // URL DE CANCELAMENTO
        // ==================================================

        cancel_url:
          `${baseUrl}/checkout/${encodedCheckoutSlug}`,

        // ==================================================
        // REFERÊNCIA
        // ==================================================

        client_reference_id:
          product.id,

        // ==================================================
        // METADATA DA SESSION
        // ==================================================

        metadata: {
          product_id:
            product.id,

          seller_id:
            product.user_id,

          customer_id:
            user.id,

          checkout_slug:
            product.checkout_slug,

          platform_fee:
            String(platformFee),

          seller_amount:
            String(sellerAmount),

          seller_stripe_account_id:
            sellerStripeAccountId,
        },

        // ==================================================
        // PAYMENT INTENT
        // ==================================================

        payment_intent_data: {
          // =================================================
          // COMISSÃO URANOVA
          // =================================================

          application_fee_amount:
            platformFee,

          // =================================================
          // METADATA DO PAYMENT INTENT
          // =================================================

          metadata: {
            product_id:
              product.id,

            seller_id:
              product.user_id,

            customer_id:
              user.id,

            checkout_slug:
              product.checkout_slug,

            seller_stripe_account_id:
              sellerStripeAccountId,

            platform_fee:
              String(platformFee),

            seller_amount:
              String(sellerAmount),
          },
        },

        // ==================================================
        // PRODUTO
        // ==================================================

        line_items: [
          {
            quantity: 1,

            price_data: {
              currency: "brl",

              unit_amount:
                amount,

              product_data: {
                name:
                  product.title,

                description:
                  product.description ??
                  undefined,

                images:
                  product.image_url
                    ? [
                        product.image_url,
                      ]
                    : [],
              },
            },
          },
        ],
      },
      {
        stripeAccount: sellerStripeAccountId,
      }
    );

    // ======================================================
    // 13. RESPOSTA
    // ======================================================

    if (!session.url) {
      console.error(
        "Stripe não retornou URL de checkout."
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível criar o checkout.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Checkout Stripe criado:",
      session.id
    );

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
        error:
          "Erro interno.",
      },
      {
        status: 500,
      }
    );
  }
}