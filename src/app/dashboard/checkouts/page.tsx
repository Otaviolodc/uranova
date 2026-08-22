"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  title: string;
  price: number;
  checkout_slug: string;
  status: string;
};

export default function CheckoutsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  async function fetchProducts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("products_checkout")
      .select(`
        id,
        title,
        price,
        checkout_slug,
        status
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const activeProducts = products.filter(
    (product) => product.status === "active"
  ).length;

  return (
    <div className="p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-8">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">

          <div>
            <div className="flex items-center gap-3 mb-3">

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-green-500/10
                  border
                  border-green-500/20
                  text-xl
                "
              >
                💳
              </div>

              <div>
                <p
                  className="
                    text-xs
                    uppercase
                    tracking-widest
                    font-bold
                    text-green-400
                  "
                >
                  Área de vendas
                </p>

                <h1
                  className="
                    text-3xl
                    md:text-4xl
                    font-black
                    tracking-tight
                    text-white
                  "
                >
                  Checkouts
                </h1>
              </div>

            </div>

            <p className="text-zinc-400">
              Gerencie seus links de pagamento em um só lugar.
            </p>
          </div>

        </div>
      </div>

      {/* RESUMO */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
          mb-8
        "
      >

        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            p-5
            transition
            hover:border-zinc-700
          "
        >
          <p className="text-sm text-zinc-500">
            Total de Checkouts
          </p>

          <div className="flex items-end justify-between mt-2">

            <p className="text-3xl font-black text-white">
              {products.length}
            </p>

            <span className="text-xl">
              🔗
            </span>

          </div>
        </div>

        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            p-5
            transition
            hover:border-green-500/20
          "
        >
          <p className="text-sm text-zinc-500">
            Checkouts Ativos
          </p>

          <div className="flex items-end justify-between mt-2">

            <p className="text-3xl font-black text-green-400">
              {activeProducts}
            </p>

            <span className="text-xl">
              ✓
            </span>

          </div>
        </div>

      </div>

      {/* TABELA */}
      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          overflow-hidden
        "
      >

        {/* TABLE HEADER */}
        <div
          className="
            px-6
            py-5
            border-b
            border-zinc-800
          "
        >
          <h2 className="text-lg font-bold text-white">
            Seus links de pagamento
          </h2>

          <p className="text-sm text-zinc-500 mt-1">
            Acesse, copie e compartilhe seus checkouts.
          </p>
        </div>

        {/* DESKTOP TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead>
              <tr
                className="
                  border-b
                  border-zinc-800
                  bg-zinc-950/50
                "
              >

                <th
                  className="
                    p-5
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-zinc-500
                    font-bold
                  "
                >
                  Produto
                </th>

                <th
                  className="
                    p-5
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-zinc-500
                    font-bold
                  "
                >
                  Preço
                </th>

                <th
                  className="
                    p-5
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-zinc-500
                    font-bold
                  "
                >
                  Link
                </th>

                <th
                  className="
                    p-5
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-zinc-500
                    font-bold
                  "
                >
                  Status
                </th>

                <th
                  className="
                    p-5
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-zinc-500
                    font-bold
                  "
                >
                  Ações
                </th>

              </tr>
            </thead>

            <tbody>

              {products.map((product) => (

                <tr
                  key={product.id}
                  className="
                    border-b
                    border-zinc-800/80
                    last:border-b-0
                    hover:bg-zinc-800/30
                    transition
                  "
                >

                  {/* PRODUTO */}
                  <td className="p-5">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-zinc-800
                          border
                          border-zinc-700
                          text-lg
                        "
                      >
                        📦
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            font-semibold
                            text-white
                            truncate
                            max-w-[300px]
                          "
                        >
                          {product.title}
                        </p>

                        <p className="text-xs text-zinc-500 mt-1">
                          Checkout de venda
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* PREÇO */}
                  <td className="p-5">

                    <span
                      className="
                        text-green-400
                        font-bold
                      "
                    >
                      R${" "}
                      {Number(product.price).toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </span>

                  </td>

                  {/* LINK */}
                  <td className="p-5">

                    <div className="flex items-center gap-2">

                      <a
                        href={`/checkout/${product.checkout_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-green-500/10
                          border
                          border-green-500/20
                          px-3
                          py-2
                          text-sm
                          font-semibold
                          text-green-400
                          hover:bg-green-500/20
                          hover:text-green-300
                          transition
                        "
                      >
                        Abrir
                        <span>↗</span>
                      </a>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/checkout/${product.checkout_slug}`
                          );

                          alert("Link copiado com sucesso ✅");
                        }}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-zinc-800
                          border
                          border-zinc-700
                          px-3
                          py-2
                          text-sm
                          font-semibold
                          text-zinc-300
                          hover:bg-zinc-700
                          hover:text-white
                          transition
                        "
                      >
                        Copiar
                      </button>

                    </div>

                  </td>

                  {/* STATUS */}
                  <td className="p-5">

                    <span
                      className={`
                        inline-flex
                        items-center
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        ${
                          product.status === "active"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }
                      `}
                    >
                      {product.status === "active"
                        ? "ATIVO"
                        : product.status.toUpperCase()}
                    </span>

                  </td>

                  {/* AÇÕES */}
                  <td className="p-5">

                    <span className="text-zinc-600">
                      —
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* EMPTY STATE */}
        {products.length === 0 && (

          <div
            className="
              px-6
              py-16
              text-center
            "
          >

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-zinc-800
                border
                border-zinc-700
                text-2xl
              "
            >
              🔗
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              Nenhum checkout criado
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Crie um produto para gerar seu primeiro link de pagamento.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}