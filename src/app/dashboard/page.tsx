"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import AIInsights from "@/components/dashboard/AIInsights";
import TopProducts from "@/components/dashboard/TopProducts";
import RecentSales from "@/components/dashboard/RecentSales";
import SalesChart from "@/components/charts/SalesChart";
import QuickActions from "@/components/dashboard/QuickActions";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function DashboardPage() {

const [revenue, setRevenue] = useState(0);
const [salesToday, setSalesToday] = useState(0);
const [ticket, setTicket] = useState(0);
const [orders, setOrders] = useState<any[]>([]);

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

  const totalRevenue =
    data?.reduce(
      (total, order) =>
        total + Number(order.amount),
      0
    ) || 0;

  setRevenue(totalRevenue);

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const todaySales =
    data?.filter((order) =>
      order.created_at?.startsWith(today)
    ).length || 0;

  setSalesToday(todaySales);

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

    <div className="p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-3xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Resumo geral da sua operação
        </p>

      </div>

      {/* CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatsCard
          title="💰 Receita Total"
          value={`R$ ${revenue.toFixed(2)}`}
          subtitle="+0% hoje"
        />

        <StatsCard
          title="🛒 Vendas"
          value={salesToday.toString()}
          subtitle="Nenhuma venda"
        />

        <StatsCard
          title="📈 Conversão"
          value="0%"
          subtitle="Sem dados"
        />

        <StatsCard
          title="🎯 Ticket Médio"
          value={`R$ ${ticket.toFixed(2)}`}
          subtitle="Sem vendas"
        />

      </div>

      <QuickActions />

      <SalesChart />

      <RecentSales />

      <TopProducts />

      <AIInsights />

    </div>
  );
}