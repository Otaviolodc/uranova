import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

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

    const { data: product, error } = await supabase
      .from("products_checkout")
      .select("*")
      .eq("checkout_slug", body.checkoutSlug)
      .maybeSingle();

    if (error) {
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

    if (!product.is_active || product.status !== "active") {
      return NextResponse.json(
        {
          error: "Produto indisponível.",
        },
        {
          status: 400,
        }
      );
    }

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_SITE_URL!;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${baseUrl}/checkout/${product.checkout_slug}`,

      client_reference_id: product.id,

      metadata: {
        product_id: product.id,
        user_id: product.user_id,
        checkout_slug: product.checkout_slug,
      },

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "brl",

            unit_amount: Math.round(
              Number(product.price) * 100
            ),

            product_data: {
              name: product.title,

              description:
                product.description ?? undefined,

              images: product.image_url
                ? [product.image_url]
                : [],
            },
          },
        },
      ],
    });

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