"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type OperationData = {
  revenue: number;
  sales: number;
  ticket: number;
  products: number;
};

export default function AllInsights() {
  const [data, setData] = useState<OperationData>({
    revenue: 0,
    sales: 0,
    ticket: 0,
    products: 0,
  });

  const [loading, setLoading] = useState(true);

  async function fetchOperationData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // ======================================================
      // VENDAS APROVADAS
      // ======================================================

      const {
        data: orders,
        error: ordersError,
      } = await supabase
        .from("orders")
        .select(`
          amount,
          status
        `)
        .eq("user_id", user.id)
        .eq("status", "PAID");

      if (ordersError) {
        console.error(
          "Erro ao carregar dados financeiros:",
          ordersError
        );
      }

      const approvedOrders = orders || [];

      const totalRevenue = approvedOrders.reduce(
        (total, order) =>
          total + Number(order.amount || 0),
        0
      );

      const totalSales = approvedOrders.length;

      const averageTicket =
        totalSales > 0
          ? totalRevenue / totalSales
          : 0;

      // ======================================================
      // PRODUTOS
      // ======================================================

      const {
        count: productsCount,
        error: productsError,
      } = await supabase
        .from("products_checkout")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);

      if (productsError) {
        console.error(
          "Erro ao carregar produtos:",
          productsError
        );
      }

      // ======================================================
      // ATUALIZA DADOS
      // ======================================================

      setData({
        revenue: totalRevenue,
        sales: totalSales,
        ticket: averageTicket,
        products: productsCount || 0,
      });
    } catch (error) {
      console.error(
        "Erro no desempenho da operação:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOperationData();
  }, []);

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

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
        <h2 className="text-2xl font-bold text-white">
          📊 Desempenho da Operação
        </h2>

        <p className="text-zinc-400 mt-2">
          Visão geral dos principais indicadores da sua operação
        </p>
      </div>

      {/* INDICADORES */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 p-6">

        {/* RECEITA */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            transition-all
          "
        >
          <p className="text-zinc-400 text-sm">
            💰 Receita total
          </p>

          <h3 className="text-2xl font-black text-white mt-3">
            {loading
              ? "—"
              : formatCurrency(data.revenue)}
          </h3>

          <p className="text-zinc-500 mt-3">
            Vendas aprovadas
          </p>
        </div>

        {/* VENDAS */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            transition-all
          "
        >
          <p className="text-zinc-400 text-sm">
            🛒 Vendas aprovadas
          </p>

          <h3 className="text-2xl font-black text-white mt-3">
            {loading ? "—" : data.sales}
          </h3>

          <p className="text-zinc-500 mt-3">
            Pedidos confirmados
          </p>
        </div>

        {/* TICKET */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            transition-all
          "
        >
          <p className="text-zinc-400 text-sm">
            🎯 Ticket médio
          </p>

          <h3 className="text-2xl font-black text-white mt-3">
            {loading
              ? "—"
              : formatCurrency(data.ticket)}
          </h3>

          <p className="text-zinc-500 mt-3">
            Valor médio por venda
          </p>
        </div>

        {/* PRODUTOS */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            transition-all
          "
        >
          <p className="text-zinc-400 text-sm">
            📦 Produtos
          </p>

          <h3 className="text-2xl font-black text-white mt-3">
            {loading ? "—" : data.products}
          </h3>

          <p className="text-zinc-500 mt-3">
            Produtos cadastrados
          </p>
        </div>

      </div>
    </div>
  );
}