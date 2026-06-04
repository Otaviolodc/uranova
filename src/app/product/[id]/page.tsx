"use client";

import { supabase }
from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductPage() {

  const params = useParams();

  const id = params.id;

  const [product, setProduct] =
    useState<any>(null);

  const [relatedProducts,
    setRelatedProducts] =
    useState<any[]>([]);

  useEffect(() => {

    fetchProduct();

  }, []);

  const fetchProduct = async () => {

    const { data } = await supabase
      .from("products_checkout")
      .select("*")
      .eq("id", id)
      .single();

    setProduct(data);

    // ANALYTICS
    await supabase
  .from("analytics")
  .insert({
    user_id: data.user_id,
    product_id: data.id,
    event_type: "product_view",
    page: "product",
  });

  console.log("Analytics salvo");

    if (data) {

      const { data: related } =
        await supabase
          .from("products_checkout")
          .select("*")
          .neq("id", data.id)
          .limit(4);

      setRelatedProducts(
        related || []
      );

    }

  };

  if (!product) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        Carregando produto...

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">

          {/* IMAGEM */}
          <div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

              {product.image_url ? (

                <img
                  src={product.image_url}
                  className="
                    w-full
                    h-[650px]
                    object-cover
                  "
                />

              ) : (

                <div
                  className="
                    h-[650px]
                    flex
                    items-center
                    justify-center
                    text-8xl
                  "
                >
                  📦
                </div>

              )}

            </div>

          </div>

          {/* INFO */}
          <div>

            {/* BADGE */}
            <div
              className="
                inline-flex
                items-center
                gap-2
                bg-green-500/10
                border
                border-green-500/20
                text-green-400
                px-5
                py-3
                rounded-full
                font-bold
                mb-6
              "
            >

              🔥 Produto em Alta

            <div className="flex gap-2 mb-6">

              <span
                className="
                  px-4
                  py-2
                  rounded-full
                  bg-blue-500/10
                  text-blue-400
                  text-sm
                  font-bold
                "
            >
                {product.product_type}
            </span>

            </div>

            </div>

            {/* TÍTULO */}
            <h1 className="text-6xl font-black leading-tight">

              {product.title}

            </h1>

            {/* DESCRIÇÃO */}
            <p className="text-gray-400 text-xl mt-8 leading-relaxed">

              {product.description ||
                "Produto digital disponível no marketplace PromoLink."}

            </p>

            {/* PREÇO */}
            <div className="mt-10">

              <p className="text-gray-500 text-lg">

                Preço

              </p>

              <h2 className="text-7xl font-black text-green-400 mt-2">

                R$ {product.price}

              </h2>

            </div>

            {/* IA */}
            <div
              className="
                mt-10
                bg-zinc-900
                border
                border-zinc-800
                rounded-3xl
                p-6
              "
            >

              <p className="text-green-400 font-bold mb-3">

                🤖 IA ANALISANDO PRODUTO

              </p>

              <p className="text-lg text-gray-300 leading-relaxed">

                Este produto está com
                alta taxa de interesse
                nas últimas horas e possui
                potencial de crescimento
                acima da média.

              </p>

            </div>

            {/* BOTÃO */}
            <a
              href={product.affiliate_url}
              target="_blank"
              className="
                mt-10
                block
                bg-green-500
                hover:bg-green-400
                transition
                text-black
                text-center
                py-6
                rounded-3xl
                font-black
                text-2xl
              "
            >

              Comprar Agora

              <p className="text-center text-zinc-500 mt-3 text-sm">
                Pagamento seguro • Liberação imediata
              </p>

            </a>

            {/* INFO PRODUTO */}
            <div className="grid grid-cols-3 gap-4 mt-10">

             <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">

              <p className="text-zinc-400 text-sm">
                Tipo
              </p>

              <h2 className="text-xl font-bold mt-2">
                {product.product_type}
              </h2>

            </div>

            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">

              <p className="text-zinc-400 text-sm">
                Status
              </p>

              <h2 className="text-xl font-bold mt-2 text-green-400">
                {product.status}
              </h2>

            </div>

            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">

              <p className="text-zinc-400 text-sm">
                Marketplace
              </p>

              <h2 className="text-xl font-bold mt-2">
                {product.is_marketplace
                  ? "Sim"
                  : "Não"}
              </h2>

            </div>

          </div>

        </div>

      </div>

        {/* RELACIONADOS */}
        <div className="mt-32">

          <div className="flex items-center justify-between mb-10">

            <div>

              <h2 className="text-5xl font-black">

                Você também pode gostar

              </h2>

              <p className="text-gray-400 mt-3 text-lg">

                Produtos recomendados pela IA

              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

            {relatedProducts.map((item) => (

              <a
                key={item.id}
                href={`/product/${item.id}`}
                className="
                  bg-zinc-900
                  border
                  border-zinc-800
                  rounded-3xl
                  overflow-hidden
                  hover:border-green-500/30
                  hover:-translate-y-2
                  transition-all
                "
              >

                {item.image_url ? (

                  <img
                    src={item.image_url}
                    className="
                      w-full
                      h-60
                      object-cover
                    "
                  />

                ) : (

                  <div className="h-60 flex items-center justify-center text-5xl">

                    📦

                  </div>

                )}

                <div className="p-5">

                  <h3 className="text-xl font-bold line-clamp-2">

                    {item.title}

                  </h3>

                  <p className="text-green-400 text-3xl font-black mt-4">

                    R$ {item.price}

                  </p>

                </div>

              </a>

            ))}

          </div>

        </div>

      </div>

    </div>

  );

}