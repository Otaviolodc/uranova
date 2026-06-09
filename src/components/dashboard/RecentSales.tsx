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

  console.log("USER:", user.id);
  console.log("ORDERS:", data);
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
        🧾 Últimas Vendas
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr
              className="
                border-b
                border-zinc-800
              "
            >

              <th className="text-left py-3 text-zinc-400">
                Cliente
              </th>

              <th className="text-left py-3 text-zinc-400">
                Valor
              </th>

              <th className="text-left py-3 text-zinc-400">
                Status
              </th>

              <th className="text-left py-3 text-zinc-400">
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
                "
              >

                <td className="py-4 text-white">
                  {sale.customer_name ||
                    "Cliente"}
                </td>

                <td
                  className="
                    py-4
                    text-green-400
                    font-semibold
                  "
                >
                  R$ {sale.amount}
                </td>

                <td className="py-4">

                  <span
                    className="
                      bg-green-500/20
                      text-green-400
                      px-3
                      py-1
                      rounded-full
                      text-sm
                    "
                  >
                    {sale.status}
                  </span>

                </td>

                <td className="py-4 text-zinc-400">

                  {new Date(
                    sale.created_at
                  ).toLocaleDateString(
                    "pt-BR"
                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}