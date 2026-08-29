"use client";

import { useEffect, useMemo, useState } from "react";
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

type Period = "7d" | "30d" | "90d" | "12m";

type Order = {
  amount: number;
  created_at: string;
};

type ChartData = {
  date: string;
  label: string;
  revenue: number;
  sales: number;
};

export default function SalesChart() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<Period>("7d");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // CALCULA O PERÍODO DA CONSULTA
  // ======================================================

  function getPeriodStart(selectedPeriod: Period) {
    const now = new Date();

    if (selectedPeriod === "12m") {
      return new Date(
        now.getFullYear(),
        now.getMonth() - 11,
        1,
        0,
        0,
        0,
        0
      );
    }

    const days =
      selectedPeriod === "7d"
        ? 7
        : selectedPeriod === "30d"
        ? 30
        : 90;

    const start = new Date(now);

    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    return start;
  }

  // ======================================================
  // BUSCA SOMENTE AS VENDAS APROVADAS DO PERÍODO
  // ======================================================

  async function fetchSales(selectedPeriod: Period) {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        setOrders([]);
        return;
      }

      const startDate = getPeriodStart(selectedPeriod);

      const { data, error } = await supabase
        .from("orders")
        .select(`
          amount,
          created_at
        `)
        .eq("user_id", user.id)
        .eq("status", "PAID")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", new Date().toISOString())
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error("SalesChart:", error);
        setOrders([]);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("SalesChart:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // CARREGAMENTO INICIAL
  // ======================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // ======================================================
  // BUSCA NOVOS DADOS QUANDO O PERÍODO MUDA
  // ======================================================

  useEffect(() => {
    if (!mounted) return;

    fetchSales(period);
  }, [period, mounted]);

  // ======================================================
  // FORMATA MOEDA
  // ======================================================

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }

  // ======================================================
  // FORMATA DATA
  // ======================================================

  function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }

  // ======================================================
  // DADOS DO GRÁFICO
  // ======================================================

  const chartData = useMemo<ChartData[]>(() => {
    const today = new Date();

    // ====================================================
    // 12 MESES
    // ====================================================

    if (period === "12m") {
      const months: ChartData[] = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(
          today.getFullYear(),
          today.getMonth() - i,
          1
        );

        const year = date.getFullYear();
        const month = date.getMonth();

        const dateKey = `${year}-${String(
          month + 1
        ).padStart(2, "0")}-01`;

        const label = date.toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        });

        months.push({
          date: dateKey,
          label: label.replace(".", ""),
          revenue: 0,
          sales: 0,
        });
      }

      // Agrupa as vendas por mês
      orders.forEach((order) => {
        if (!order.created_at) return;

        const created = new Date(order.created_at);

        const year = created.getFullYear();
        const month = created.getMonth();

        const item = months.find((entry) => {
          const entryDate = new Date(
            `${entry.date}T12:00:00`
          );

          return (
            entryDate.getFullYear() === year &&
            entryDate.getMonth() === month
          );
        });

        if (item) {
          item.revenue += Number(order.amount) || 0;
          item.sales += 1;
        }
      });

      return months;
    }

    // ====================================================
    // 7 / 30 / 90 DIAS
    // ====================================================

    const daysToShow =
      period === "7d"
        ? 7
        : period === "30d"
        ? 30
        : 90;

    const days: ChartData[] = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - i);

      days.push({
        date: formatDate(date),

        label:
          daysToShow <= 30
            ? String(date.getDate()).padStart(2, "0")
            : date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              }),

        revenue: 0,
        sales: 0,
      });
    }

    // Agrupa as vendas por dia
    orders.forEach((order) => {
      if (!order.created_at) return;

      const created = new Date(order.created_at);

      const dateKey = formatDate(created);

      const item = days.find(
        (entry) => entry.date === dateKey
      );

      if (item) {
        item.revenue += Number(order.amount) || 0;
        item.sales += 1;
      }
    });

    return days;
  }, [orders, period]);

  // ======================================================
  // TOOLTIP
  // ======================================================

  function CustomTooltip({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload?: ChartData;
      value?: number;
    }>;
  }) {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const item = payload[0]?.payload;

    if (!item) return null;

    const date = new Date(
      `${item.date}T12:00:00`
    );

    let dateLabel = "";

    if (period === "12m") {
      dateLabel = date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
    } else {
      dateLabel = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }

    return (
      <div className="min-w-[190px] rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 shadow-2xl">
        <p className="mb-2 text-sm capitalize text-zinc-400">
          {dateLabel}
        </p>

        <p className="text-xl font-bold text-white">
          {formatCurrency(item.revenue)}
        </p>

        <div className="mt-2 flex items-center justify-between gap-6 border-t border-zinc-800 pt-2">
          <span className="text-xs text-zinc-500">
            Vendas
          </span>

          <span className="text-sm font-semibold text-green-400">
            {item.sales}
          </span>
        </div>
      </div>
    );
  }

  // ======================================================
  // CONFIGURAÇÃO DO EIXO X
  // ======================================================

  const xAxisInterval =
    period === "7d"
      ? 0
      : period === "30d"
      ? 4
      : period === "90d"
      ? 13
      : 1;

  // ======================================================
  // EVITA PROBLEMAS DE HYDRATION
  // ======================================================

  if (!mounted) {
    return null;
  }

  // ======================================================
  // RENDER
  // ======================================================

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
          CABEÇALHO
      ================================================== */}

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Receita dos últimos dias
          </h2>

          <p className="mt-2 text-sm text-zinc-400 md:text-base">
            Evolução das vendas da sua operação
          </p>
        </div>

        {/* ==================================================
            FILTROS
        ================================================== */}

        <div className="flex w-full rounded-xl border border-zinc-800 bg-zinc-950 p-1 md:w-auto">
          {[
            {
              value: "7d" as Period,
              label: "7 dias",
            },
            {
              value: "30d" as Period,
              label: "30 dias",
            },
            {
              value: "90d" as Period,
              label: "90 dias",
            },
            {
              value: "12m" as Period,
              label: "12 meses",
            },
          ].map((option) => {
            const active =
              period === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setPeriod(option.value)
                }
                className={`
                  flex-1
                  rounded-lg
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  transition-all
                  md:flex-none
                  md:px-4
                  md:text-sm
                  ${
                    active
                      ? "bg-green-500 text-black shadow-lg shadow-green-500/10"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================
          GRÁFICO
      ================================================== */}

      <div className="mt-8 h-[320px] w-full md:h-[360px]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-zinc-500">
            Carregando dados...
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              {/* ==================================================
                  DEGRADÊ
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
                    offset="65%"
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
                  GRADE
              ================================================== */}

              <CartesianGrid
                stroke="#27272a"
                vertical={false}
              />

              {/* ==================================================
                  EIXO X
              ================================================== */}

              <XAxis
                dataKey="label"
                interval={xAxisInterval}
                axisLine={{
                  stroke: "#3f3f46",
                }}
                tickLine={false}
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                }}
                tickMargin={12}
              />

              {/* ==================================================
                  EIXO Y
              ================================================== */}

              <YAxis
                axisLine={false}
                tickLine={false}
                width={75}
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
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
                  ÁREA
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
                animationDuration={700}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}