"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import ProductCard from "@/components/marketplace/ProductCard";

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products_checkout")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    }

    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const searchMatch =
      product.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const categoryMatch =
      category === "Todos"
        ? true
        : product.product_type === category;

    return searchMatch && categoryMatch;
  });

  const categories = [
    "Todos",
    "curso",
    "ebook",
    "pdf",
    "ferramenta",
  ];

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="mb-8">

        <h1 className="text-5xl font-black text-white">
          Marketplace
        </h1>

        <p className="text-zinc-400 mt-2">
          {filteredProducts.length} produto
          {filteredProducts.length !== 1 && "s"} encontrado
          {filteredProducts.length !== 1 && "s"}
        </p>

      </div>

      {/* BUSCA */}
      <div className="mb-8">

        <input
          type="text"
          placeholder="🔍 Buscar produto..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            w-full
            max-w-xl
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-5
            py-4
            text-white
            outline-none
            focus:border-green-500
          "
        />

      </div>

      {/* CATEGORIAS */}
      <div className="flex flex-wrap gap-3 mb-10">

        {categories.map((item) => (

          <button
            key={item}
            onClick={() =>
              setCategory(item)
            }
            className={`
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition-all

              ${
                category === item
                  ? "bg-green-500 text-black"
                  : "bg-zinc-900 text-white border border-zinc-800"
              }
            `}
          >
            {item}
          </button>

        ))}

      </div>

      {/* LOADING */}
      {loading ? (

        <div className="text-zinc-400">
          Carregando produtos...
        </div>

      ) : filteredProducts.length === 0 ? (

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
          <h2 className="text-2xl font-bold text-white">
            Nenhum produto encontrado
          </h2>

          <p className="text-zinc-400 mt-3">
            Tente alterar a busca ou a categoria.
          </p>
        </div>

      ) : (

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-8
          "
        >

          {filteredProducts.map((product) => (

            <ProductCard
              key={product.id}
              product={product}
            />

          ))}

        </div>

      )}

    </div>
  );
}