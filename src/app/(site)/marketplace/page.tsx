"use client";

import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  checkout_slug: string;
  type: string;
};

export default function MarketplacePage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("todos");

  const [sortBy, setSortBy] =
    useState("recentes");

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    const { data, error } = await supabase
  .from("products_checkout")
  .select(`
  id,
  title,
  description,
  price,
  image_url,
  checkout_slug,
  type
  `)
  .eq("status", "active")
  .eq("is_marketplace", true)
  .order("created_at", {
    ascending: false,
  });

if (error) {
  console.error(error);
  return;
}

setProducts(data || []);

  };

  const filteredProducts =
  products.filter((product) => {

    const matchesSearch =
      product.title
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchesCategory =
      category === "todos"
        ? true
        : product.type === category;

    return (
      matchesSearch &&
      matchesCategory
    );

  });

  const sortedProducts =
  [...filteredProducts];

if (sortBy === "menor-preco") {

  sortedProducts.sort(
    (a, b) =>
      Number(a.price) -
      Number(b.price)
  );

}

if (sortBy === "maior-preco") {

  sortedProducts.sort(
    (a, b) =>
      Number(b.price) -
      Number(a.price)
  );

}

if (sortBy === "az") {

  sortedProducts.sort(
    (a, b) =>
      a.title.localeCompare(
        b.title
      )
  );

}

  return (

  <div className="flex bg-black text-white min-h-screen">

    <div className="flex-1">

      {/* HERO */}
      <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-black">

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">

          <div className="max-w-3xl">

            <p className="text-green-400 font-bold mb-4">

              MARKETPLACE OFICIAL

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
              digitais da comunidade Uranova.

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

            <div className="grid grid-cols-3 gap-6 mt-12">

  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
    <h2 className="text-4xl font-black text-green-400">
      {products.length}
    </h2>
    <p className="text-gray-400 mt-2">
      Produtos
    </p>
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
    <h2 className="text-4xl font-black text-green-400">
      5
    </h2>
    <p className="text-gray-400 mt-2">
      Categorias
    </p>
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
    <h2 className="text-4xl font-black text-green-400">
      Ativo
    </h2>
    <p className="text-gray-400 mt-2">
      Marketplace
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
             "todos",
             "ebook",
             "curso",
             "pdf",
             "ferramenta",
             "mentoria",
          ].map((item) => (

            <button
              key={item}
              onClick={() =>
                setCategory(item)
              }
              className={`
                whitespace-nowrap
                px-6
                py-3
                rounded-2xl
                text-sm
                font-semibold
                border
                transition

                ${
                  category === item
                    ? "bg-green-500 text-black border-green-500"
                    : "bg-zinc-900 border-zinc-800"
                }
             `}
          >
              {item.charAt(0).toUpperCase() + item.slice(1)}

            </button>

          ))}

        </div>

      </div>

      {/* ORDENAÇÃO */}
<div className="max-w-7xl mx-auto px-6 mt-6">

  <select
    value={sortBy}
    onChange={(e) =>
      setSortBy(e.target.value)
    }
    className="
      bg-zinc-900
      border
      border-zinc-800
      px-4
      py-3
      rounded-2xl
      text-white
    "
  >
    <option value="recentes">
      Mais recentes
    </option>

    <option value="menor-preco">
      Menor preço
    </option>

    <option value="maior-preco">
      Maior preço
    </option>

    <option value="az">
      A-Z
    </option>

  </select>

</div>

      {/* RECENTES */}
<div className="max-w-7xl mx-auto px-6 mt-10">

  <h2 className="text-3xl font-black mb-6">
    Novidades do Marketplace
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {products
      .slice(0, 3)
      .map((product) => (

        <Link
          key={product.id}
          href={`/product/${product.checkout_slug}`}
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-5
            hover:border-green-500/30
            transition-all
          "
        >

          <p className="text-green-400 text-sm font-bold">
            NOVO
          </p>

          <h3 className="text-xl font-bold mt-2">
            {product.title}
          </h3>

          <p className="text-green-400 text-2xl font-black mt-4">
            R$ {product.price}
          </p>

        </Link>

      ))}

  </div>

</div>

      {/* PRODUTOS */}
      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="flex items-center justify-between mb-10">

          <div>

            <h2 className="text-2xl md:text-4xl font-black">

              Produtos em Destaque

            </h2>

            <p className="text-zinc-500 mt-2">
              {sortedProducts.length} produtos encontrados
            </p>

            <p className="text-gray-400 mt-2">

              Produtos disponíveis no marketplace

            </p>

          </div>

        </div>

        {filteredProducts.length === 0 ? (

          <div className="text-center text-gray-500 py-32">

            Nenhum produto encontrado

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

            {sortedProducts.map((product) => (

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

                    <Image
                      src={product.image_url}
                      alt={product.title}
                      fill
                      className="
                        object-cover
                        group-hover:scale-110
                        transition-all
                        duration-500
                      "
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-6xl">

                      Produto

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

                    {product.type?.toUpperCase()}

                  </div>

                </div>

                {/* CONTEÚDO */}
                <div className="p-6">

                  <h2 className="text-2xl font-black line-clamp-2">

                    {product.title}

                  </h2>

                  <p className="text-green-400 text-sm font-semibold mt-2">
                    ● Produto Ativo
                  </p>

                  <p className="text-gray-400 text-sm mt-4 line-clamp-3">

                    {product.description ||
                      "Produto digital disponível no marketplace Uranova."}

                  </p>

                  {/* FOOTER */}
                  <div className="mt-8 flex items-end justify-between">

                    <div>

                      <p className="text-sm text-gray-500">

                        Preço

                      </p>

                      <h3 className="text-4xl font-black text-green-400">

                        R$ {product.price}

                      </h3>

                      <p className="text-zinc-500 text-sm mt-4">
                        Marketplace Uranova
                      </p>

                    </div>

                  </div>

                  {/* BOTÃO */}
                  <Link
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

                    Ver Produto

                  </Link>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">

  <div
    className="
      bg-zinc-900
      border
      border-zinc-800
      rounded-3xl
      p-10
      text-center
    "
  >

    <h2 className="text-4xl font-black">

      Marketplace em Crescimento

    </h2>

    <p className="text-zinc-400 mt-4 text-lg">

      Já são {products.length} produtos
      publicados pela comunidade Uranova.

    </p>

  </div>

</div>

      {/* CTA */}
      <div className="border-t border-zinc-800">

        <div className="max-w-5xl mx-auto px-6 py-24 text-center">

          <h2 className="text-3xl md:text-6xl font-black leading-tight">

            Venda seus produtos
            no Uranova 

          </h2>

          <p className="text-gray-400 text-lg md:text-2xl mt-6">

            Crie produtos digitais,
            links de afiliado e aumente
            sua conversão com IA.

          </p>

          <Link
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

          </Link>

        </div>

      </div>

    </div>

  </div>

  );

}