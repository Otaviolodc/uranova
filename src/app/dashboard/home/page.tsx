"use client";

import { supabase }
from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function HomeDashboard() {

  const [orders, setOrders] =
    useState<any[]>([]);

  const [revenue, setRevenue] =
    useState(0);

  const [salesToday, setSalesToday] =
    useState(0);

  const [ticket, setTicket] =
    useState(0);

  async function fetchOrders() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id);

    setOrders(data || []);

    // 💰 faturamento
    const totalRevenue =
      data?.reduce(
        (total, order) =>
          total + Number(order.amount),
        0
      ) || 0;

    setRevenue(totalRevenue);

    // 🛒 vendas hoje
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const todaySales =
      data?.filter((order) =>
        order.created_at?.startsWith(today)
      ).length || 0;

    setSalesToday(todaySales);

    // 🎯 ticket médio
    const avgTicket =
      totalRevenue > 0
        ? totalRevenue /
          (data?.length || 1)
        : 0;

    setTicket(avgTicket);

  }

  useEffect(() => {

    fetchOrders();

  }, []);

  return (

    <div className="
      min-h-screen
      bg-black
      text-white
      p-8
    ">

      <h1 className="
        text-4xl
        font-black
        mb-10
      ">
        💰 Dashboard Financeiro
      </h1>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">

        {/* FATURAMENTO */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-6
        ">

          <p className="text-gray-400">
            Faturamento
          </p>

          <h2 className="
            text-4xl
            font-black
            mt-3
            text-green-400
          ">

            R$ {revenue.toFixed(2)}

          </h2>

        </div>

        {/* VENDAS */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-6
        ">

          <p className="text-gray-400">
            Vendas Hoje
          </p>

          <h2 className="
            text-4xl
            font-black
            mt-3
          ">

            {salesToday}

          </h2>

        </div>

        {/* TICKET */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-6
        ">

          <p className="text-gray-400">
            Ticket Médio
          </p>

          <h2 className="
            text-4xl
            font-black
            mt-3
          ">

            R$ {ticket.toFixed(2)}

          </h2>

        </div>

        {/* TOTAL PEDIDOS */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-6
        ">

          <p className="text-gray-400">
            Pedidos
          </p>

          <h2 className="
            text-4xl
            font-black
            mt-3
          ">

            {orders.length}

          </h2>

        </div>

      </div>

    </div>

  );

}