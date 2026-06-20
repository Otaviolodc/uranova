"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function RecentSales() {

  const [sales, setSales] =
    useState<any[]>([]);

  async function fetchSales() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(10);

    setSales(data || []);
  }

  useEffect(() => {
    fetchSales();
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
          🧾 Últimas Vendas
        </h2>

        <p className="text-zinc-400 mt-2">
          Pedidos mais recentes da sua operação
        </p>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead
            className="
              border-b
              border-zinc-800
              bg-zinc-950
            "
          >

            <tr>

              <th className="text-left p-5 text-zinc-400">
                Produto
              </th>

              <th className="text-left p-5 text-zinc-400">
                Cliente
              </th>

              <th className="text-left p-5 text-zinc-400">
                Valor
              </th>

              <th className="text-left p-5 text-zinc-400">
                Status
              </th>

              <th className="text-left p-5 text-zinc-400">
                Data
              </th>

            </tr>

          </thead>

          <tbody>

            {sales.map((sale) => (

              <tr
                key={sale.id}
                className="
                  border-b
                  border-zinc-800
                  hover:bg-zinc-950
                  transition
                "
              >

                <td className="p-5 text-white font-medium">
                  {sale.product_name || "Produto"}
                </td>

                <td className="p-5 text-white">
                  {sale.customer_name || "Cliente"}
                </td>

                <td
                  className="
                    p-5
                    text-green-400
                    font-bold
                  "
                >
                  R$ {Number(sale.amount).toFixed(2)}
                </td>

                <td className="p-5">

                  <span
                    className="
                      bg-green-500/20
                      text-green-400
                      px-4
                      py-2
                      rounded-full
                      text-sm
                      font-medium
                    "
                  >
                    {sale.status}
                  </span>

                </td>

                <td className="p-5 text-zinc-400">

                  {new Date(
                    sale.created_at
                  ).toLocaleDateString("pt-BR")}

                </td>

              </tr>

            ))}

            {sales.length === 0 && (

              <tr>

                <td
                  colSpan={5}
                  className="
                    p-10
                    text-center
                    text-zinc-500
                  "
                >
                  Nenhuma venda encontrada.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );
}