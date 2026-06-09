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
        p-6
      "
    >

      <h2
        className="
          text-2xl
          font-bold
          text-white
          mb-6
        "
      >
        🔥 Seus Produtos
      </h2>

      {products.length === 0 ? (

        <div
          className="
            text-center
            py-10
            text-zinc-500
          "
        >
          Nenhum produto encontrado
        </div>

      ) : (

        <div className="space-y-4">

          {products.map(
            (product, index) => (
              <div
                key={product.id}
                className="
                  flex
                  items-center
                  justify-between
                  bg-black
                  border
                  border-zinc-800
                  rounded-2xl
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >

                  <span className="text-2xl">
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : "📦"}
                  </span>

                  <div>

                    <h3
                      className="
                        text-white
                        font-semibold
                      "
                    >
                      {product.title}
                    </h3>

                    <p
                      className="
                        text-zinc-400
                        text-sm
                      "
                    >
                      {product.product_type}
                    </p>

                  </div>

                </div>

                <div
                  className="
                    text-green-400
                    font-bold
                  "
                >
                  R$ {product.price}
                </div>

              </div>
            )
          )}

        </div>

      )}

    </div>
  );
}