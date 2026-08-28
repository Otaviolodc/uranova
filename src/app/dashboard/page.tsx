"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import AIInsights from "@/components/dashboard/AIInsights";
import TopProducts from "@/components/dashboard/TopProducts";
import RecentSales from "@/components/dashboard/RecentSales";
import SalesChart from "@/components/charts/SalesChart";
import QuickActions from "@/components/dashboard/QuickActions";
import { StatsCard } from "@/components/dashboard/StatsCard";

type Order = {
  amount: number;
  created_at: string;
  status: string;
};

export default function DashboardPage() {
  const [revenue, setRevenue] = useState(0);
  const [sales, setSales] = useState(0);
  const [ticket, setTicket] = useState(0);

  async function fetchOrders() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const {
      data,
      error,
    } = await supabase
      .from("orders")
      .select(`
        amount,
        created_at,
        status
      `)
      .eq("user_id", user.id)
      .eq("status", "PAID");

    if (error) {
      console.error("Dashboard:", error);
      return;
    }

    const orders: Order[] = data || [];

    // ======================================================
    // VENDAS APROVADAS
    // ======================================================

    const totalSales = orders.length;

    // ======================================================
    // RECEITA TOTAL
    // ======================================================

    const totalRevenue = orders.reduce(
      (total, order) =>
        total + Number(order.amount),
      0
    );

    // ======================================================
    // TICKET MÉDIO
    // ======================================================

    const averageTicket =
      totalSales > 0
        ? totalRevenue / totalSales
        : 0;

    setRevenue(totalRevenue);
    setSales(totalSales);
    setTicket(averageTicket);
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
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatsCard
          title="💰 Receita Total"
          value={`R$ ${revenue.toFixed(2)}`}
          subtitle="Receita acumulada"
        />

        <StatsCard
          title="🛒 Vendas"
          value={sales.toString()}
          subtitle="Vendas aprovadas"
        />

        <StatsCard
          title="📈 Conversão"
          value="—"
          subtitle="Dados de conversão indisponíveis"
        />

        <StatsCard
          title="🎯 Ticket Médio"
          value={`R$ ${ticket.toFixed(2)}`}
          subtitle="Valor médio por pedido"
        />

      </div>

      {/* AÇÕES RÁPIDAS */}
      <QuickActions />

      {/* GRÁFICO */}
      <SalesChart />

      {/* VENDAS RECENTES */}
      <RecentSales />

      {/* PRODUTO MAIS VENDIDO */}
      <TopProducts />

      {/* DESEMPENHO DA OPERAÇÃO */}
      <AIInsights />

    </div>
  );
}