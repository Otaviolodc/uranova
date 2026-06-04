"use client";

import { supabase }
from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function MarketplacePage() {

  const [products, setProducts] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    const { data } = await supabase
      .from("products_checkout")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    setProducts(data || []);

  };

  const filteredProducts =
    products.filter((product) =>
      product.title
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

  <div className="flex bg-black text-white min-h-screen">

    <div className="flex-1">

      {/* HERO */}
      <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-black">

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">

          <div className="max-w-3xl">

            <p className="text-green-400 font-bold mb-4">

              🔥 MARKETPLACE OFICIAL

            </p>

            <h1 className="text-4xl md:text-7xl font-black leading-tight">

              Descubra Produtos
              <span className="text-green-400">
                {" "}Virais
              </span>

            </h1>

            <p className="text-gray-400 text-lg md:text-2xl mt-6 leading-relaxed">

              Cursos, ebooks, ferramentas,
              produtos físicos e conteúdos
              digitais da comunidade PromoLink.

            </p>

            {/* BUSCA */}
            <div className="mt-10 flex flex-col md:flex-row gap-4">

              <input
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="
                  flex-1
                  bg-zinc-900
                  border
                  border-zinc-800
                  h-16
                  px-6
                  rounded-2xl
                  text-lg
                  outline-none
                  focus:border-green-500
                "
              />

              <button
                className="
                  w-full md:w-auto
                  bg-green-500
                  hover:bg-green-400
                  transition
                  text-black
                  px-10
                  rounded-2xl
                  font-bold
                  text-lg
                "
              >

                Buscar

              </button>

            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mt-12">

              <div>

                <h2 className="text-2xl md:text-4xl font-black text-green-400">

                  {products.length}+

                </h2>

                <p className="text-gray-400 mt-2">

                  Produtos

                </p>

              </div>

              <div>

                <h2 className="text-2xl md:text-4xl font-black text-green-400">

                  24h

                </h2>

                <p className="text-gray-400 mt-2">

                  Atualização IA

                </p>

              </div>

              <div>

                <h2 className="text-2xl md:text-4xl font-black text-green-400">

                  IA

                </h2>

                <p className="text-gray-400 mt-2">

                  Recomendação Inteligente

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* CATEGORIAS */}
      <div className="max-w-7xl mx-auto px-6 mt-12">

        <div className="flex gap-4 overflow-x-auto pb-2">

          {[
            "🔥 Em Alta",
            "📚 Cursos",
            "💻 Ferramentas",
            "📱 Apps",
            "🏋 Fitness",
            "🧠 IA",
            "📦 Produtos",
            "🎨 Design",
          ].map((item) => (

            <button
              key={item}
              className="
                whitespace-nowrap
                bg-zinc-900
                border
                border-zinc-800
                hover:border-green-500
                transition
                px-6
                py-3
                rounded-2xl
                text-sm
                font-semibold
              "
            >

              {item}

            </button>

          ))}

        </div>

      </div>

      {/* PRODUTOS */}
      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="flex items-center justify-between mb-10">

          <div>

            <h2 className="text-2xl md:text-4xl font-black">

              🚀 Produtos em Alta

            </h2>

            <p className="text-gray-400 mt-2">

              Produtos mais acessados hoje

            </p>

          </div>

        </div>

        {filteredProducts.length === 0 ? (

          <div className="text-center text-gray-500 py-32">

            Nenhum produto encontrado

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

            {filteredProducts.map((product) => (

              <div
                key={product.id}
                className="
                  group
                  bg-zinc-900
                  border
                  border-zinc-800
                  rounded-3xl
                  overflow-hidden
                  hover:border-green-500/40
                  hover:-translate-y-2
                  transition-all
                "
              >

                {/* IMAGEM */}
                <div className="relative h-64 bg-zinc-800 overflow-hidden">

                  {product.image_url ? (

                    <img
                      src={product.image_url}
                      className="
                        w-full
                        h-full
                        object-cover
                        group-hover:scale-110
                        transition-all
                        duration-500
                      "
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-6xl">

                      📦

                    </div>

                  )}

                  {/* BADGE */}
                  <div
                    className="
                      absolute
                      top-4
                      left-4
                      bg-green-500
                      text-black
                      px-4
                      py-2
                      rounded-full
                      text-xs
                      font-black
                    "
                  >

                    🔥 EM ALTA

                  </div>

                </div>

                {/* CONTEÚDO */}
                <div className="p-6">

                  <h2 className="text-2xl font-black line-clamp-2">

                    {product.title}

                  </h2>

                  <p className="text-gray-400 text-sm mt-4 line-clamp-3">

                    {product.description ||
                      "Produto digital disponível no marketplace PromoLink."}

                  </p>

                  {/* FOOTER */}
                  <div className="mt-8 flex items-end justify-between">

                    <div>

                      <p className="text-sm text-gray-500">

                        Preço

                      </p>

                      <h3 className="text-2xl md:text-4xl font-black text-green-400">

                        R$ {product.price}

                      </h3>

                    </div>

                  </div>

                  {/* BOTÃO */}
                  <a
                    href={`/product/${product.checkout_slug}`}
                    target="_blank"
                    className="
                      mt-8
                      block
                      text-center
                      bg-green-500
                      hover:bg-green-400
                      transition
                      text-black
                      py-4
                      rounded-2xl
                      font-black
                      text-lg
                    "
                  >

                    Comprar Agora

                  </a>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* CTA */}
      <div className="border-t border-zinc-800">

        <div className="max-w-5xl mx-auto px-6 py-24 text-center">

          <h2 className="text-3xl md:text-6xl font-black leading-tight">

            Venda seus produtos
            no PromoLink 🚀

          </h2>

          <p className="text-gray-400 text-lg md:text-2xl mt-6">

            Crie produtos digitais,
            links de afiliado e aumente
            sua conversão com IA.

          </p>

          <a
            href="/dashboard/store"
            className="
              inline-block
              mt-10
              bg-green-500
              hover:bg-green-400
              transition
              text-black
              px-12
              py-5
              rounded-3xl
              font-black
              text-xl
            "
          >

            Começar Agora

          </a>

        </div>

      </div>

    </div>

  </div>

  );

}