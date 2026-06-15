import CouponBox
from "@/components/checkout/CouponBox";

import PixCheckout
from "@/components/PixCheckout";

import { createClient }
from "@/lib/supabase/server";
import Image from "next/image";

interface Props {
  params: {
    slug: string;
  };
}

export default async function CheckoutPage({
  params,
}: Props) {

  const supabase =
    await createClient();

  const {
    data: product,
    error,
  } =

    await supabase
      .from("products_checkout")
      .select("*")
      .eq(
        "checkout_slug",
        params.slug
      )
      .maybeSingle();

  if (error) {

  return (
    <div className="
      min-h-screen
      bg-black
      text-white
      flex
      items-center
      justify-center
    ">
      Erro ao carregar produto
    </div>
  );

}

  if (!product) {

    return (

      <div className="bg-black text-white min-h-screen flex items-center justify-center">

        Produto não encontrado

      </div>

    );

  }

  return (

    <div className="bg-black text-white min-h-screen">

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* IMAGEM */}
          <div>

            <Image
              src={product.image_url || "/placeholder.png"}
              alt={product.title}
              width={800}
              height={800}
              unoptimized
              className="
                w-full
                rounded-3xl
                border
                border-zinc-800
                shadow-2xl
              "
            />

          </div>

          {/* CONTEÚDO */}
          <div>

            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500 text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              🚀 Produto Digital
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              {product.title}
            </h1>

            <p className="text-zinc-400 text-lg mt-6 leading-relaxed">
              {product.description}
            </p>

            {/* PREÇO */}
            <div className="mt-10">

              <div className="text-6xl font-black text-green-400 mt-2">
                R$ {product.price}
              </div>

              <CouponBox
                price={Number(product.price)}
              />

            </div>

            {/* BENEFÍCIOS */}
            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-3">
                ✅ Acesso imediato
              </div>

              <div className="flex items-center gap-3">
                ✅ Download liberado
              </div>

              <div className="flex items-center gap-3">
                ✅ Garantia de 7 dias
              </div>

              <div className="flex items-center gap-3">
                ✅ Atualizações grátis
              </div>

            </div>

            {/* BOTÃO */}
            <div className="mt-12">

              <PixCheckout
                price={Number(product.price)}
                userId={product.user_id}
              />

            </div>
            
            {/* PROVA SOCIAL */}
            <div className="mt-8 text-sm text-zinc-500">

              🔥 1.247 pessoas compraram nas últimas semanas

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}