"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ChartData = {
  date: string;
  day: string;
  revenue: number;
};

export default function SalesChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [mounted, setMounted] = useState(false);

  async function fetchSales() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) return;

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        amount,
        created_at
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("SalesChart:", error);
      return;
    }

    // ======================================================
    // ÚLTIMOS 7 DIAS
    // ======================================================

    const today = new Date();

    const days: ChartData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);

      date.setDate(today.getDate() - i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const dayNumber = String(date.getDate()).padStart(2, "0");

      const dateKey = `${year}-${month}-${dayNumber}`;

      days.push({
        date: dateKey,
        day: dayNumber,
        revenue: 0,
      });
    }

    // ======================================================
    // AGRUPA AS VENDAS POR DATA
    // ======================================================

    (orders || []).forEach((order) => {
      if (!order.created_at) return;

      const dateKey = order.created_at.slice(0, 10);

      const item = days.find(
        (day) => day.date === dateKey
      );

      if (item) {
        item.revenue += Number(order.amount) || 0;
      }
    });

    setData(days);
  }

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // ======================================================
  // FORMATAÇÃO DE MOEDA
  // ======================================================

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }

  // ======================================================
  // TOOLTIP PERSONALIZADO
  // ======================================================

  function CustomTooltip({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      value?: number;
    }>;
    label?: string;
  }) {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const value = Number(payload[0]?.value || 0);

    return (
      <div className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 shadow-2xl">
        <p className="mb-1 text-sm text-zinc-400">
          {label}
        </p>

        <p className="text-lg font-bold text-white">
          {formatCurrency(value)}
        </p>

        <p className="mt-1 text-xs text-green-400">
          Receita
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        mt-10
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900
        p-6
        md:p-8
      "
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Receita dos últimos dias
        </h2>

        <p className="mt-2 text-sm text-zinc-400 md:text-base">
          Evolução das vendas da sua operação
        </p>
      </div>

      {/* ==================================================
          GRÁFICO
      ================================================== */}

      <div className="h-[320px] w-full md:h-[360px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            {/* ==================================================
                DEGRADÊ DA ÁREA
            ================================================== */}

            <defs>
              <linearGradient
                id="uranovaRevenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#22c55e"
                  stopOpacity={0.32}
                />

                <stop
                  offset="70%"
                  stopColor="#22c55e"
                  stopOpacity={0.08}
                />

                <stop
                  offset="100%"
                  stopColor="#22c55e"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            {/* ==================================================
                GRID
            ================================================== */}

            <CartesianGrid
              stroke="#27272a"
              strokeDasharray="0"
              vertical={false}
            />

            {/* ==================================================
                EIXO X
            ================================================== */}

            <XAxis
              dataKey="day"
              axisLine={{
                stroke: "#3f3f46",
              }}
              tickLine={false}
              tick={{
                fill: "#71717a",
                fontSize: 12,
              }}
              tickMargin={12}
            />

            {/* ==================================================
                EIXO Y
            ================================================== */}

            <YAxis
              axisLine={false}
              tickLine={false}
              width={70}
              tick={{
                fill: "#71717a",
                fontSize: 12,
              }}
              tickFormatter={(value) =>
                formatCurrency(Number(value))
              }
            />

            {/* ==================================================
                TOOLTIP
            ================================================== */}

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#52525b",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            {/* ==================================================
                ÁREA + LINHA
            ================================================== */}

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={3}
              fill="url(#uranovaRevenueGradient)"
              fillOpacity={1}
              dot={false}
              activeDot={{
                r: 6,
                stroke: "#18181b",
                strokeWidth: 3,
                fill: "#22c55e",
              }}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}