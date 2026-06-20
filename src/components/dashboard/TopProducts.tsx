"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function TopProducts() {

  const [products, setProducts] =
    useState<any[]>([]);

  async function fetchProducts() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("products_checkout")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    setProducts(data || []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (

    <div
      className="
        mt-10
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        overflow-hidden
      "
    >

      {/* HEADER */}
      <div
        className="
          p-6
          border-b
          border-zinc-800
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          🔥 Produtos em Destaque
        </h2>

        <p className="text-zinc-400 mt-2">
          Produtos mais recentes da sua operação
        </p>

      </div>

      {products.length === 0 ? (

        <div
          className="
            py-16
            text-center
            text-zinc-500
          "
        >
          Nenhum produto encontrado
        </div>

      ) : (

        <div className="p-6 space-y-4">

          {products.map((product, index) => (

            <div
              key={product.id}
              className="
                flex
                items-center
                justify-between
                bg-black
                border
                border-zinc-800
                rounded-3xl
                p-5
                hover:border-green-500/30
                hover:-translate-y-1
                transition-all
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-5
                "
              >

                <div className="text-3xl">

                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : "📦"}

                </div>

                <div>

                  <h3
                    className="
                      text-white
                      font-bold
                      text-lg
                    "
                  >
                    {product.title}
                  </h3>

                  <p
                    className="
                      text-zinc-400
                      mt-1
                    "
                  >
                    {product.product_type}
                  </p>

                </div>

              </div>

              <div className="text-right">

                <h2
                  className="
                    text-green-400
                    text-2xl
                    font-black
                  "
                >
                  R$ {Number(product.price).toFixed(2)}
                </h2>

                <p className="text-zinc-500 text-sm mt-1">
                  Produto ativo
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}