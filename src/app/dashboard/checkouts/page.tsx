"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function CheckoutsPage() {

  const [products, setProducts] =
    useState<any[]>([]);

  async function fetchProducts() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } =
      await supabase
        .from("products_checkout")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

    setProducts(data || []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6 md:p-8">

      <div className="mb-10">

        <h1 className="text-3xl font-bold text-white">
          Checkouts
        </h1>

        <p className="text-zinc-400 mt-2">
          Gerencie seus links de pagamento
        </p>

      </div>

      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          overflow-hidden
        "
      >

        <table className="w-full">

          <thead>

            <tr className="border-b border-zinc-800">

              <th className="p-4 text-left">Produto</th>
              <th className="p-4 text-left">Preço</th>
              <th className="p-4 text-left">Slug</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Ações</th>

            </tr>

          </thead>

          <tbody>

            {products.map((product) => (

              <tr
                key={product.id}
                className="
                  border-b
                  border-zinc-800
                "
              >

                <td className="p-4">
  {product.checkout_slug}
</td>

<td className="p-4">
  <span
    className={`
      px-3
      py-1
      rounded-full
      text-xs
      font-bold

      ${
        product.status === "active"
          ? "bg-green-500/10 text-green-400"
          : "bg-red-500/10 text-red-400"
      }
    `}
  >
    {product.status}
  </span>
</td>

<td className="p-4">

  <div className="flex gap-3">

    <a
      href={`/product/${product.checkout_slug}`}
      target="_blank"
      className="
        text-green-400
        hover:text-green-300
      "
    >
      Abrir
    </a>

    <button
      onClick={() => {
        navigator.clipboard.writeText(
          `${window.location.origin}/product/${product.checkout_slug}`
        );

        alert("Link copiado ✅");
      }}
      className="
        text-blue-400
        hover:text-blue-300
      "
    >
      Copiar
    </button>

  </div>

</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}