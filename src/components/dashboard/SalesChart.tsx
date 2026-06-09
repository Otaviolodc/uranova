"use client";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "01", vendas: 12 },
  { day: "05", vendas: 25 },
  { day: "10", vendas: 18 },
  { day: "15", vendas: 35 },
  { day: "20", vendas: 28 },
  { day: "25", vendas: 50 },
  { day: "30", vendas: 42 },
];

export default function SalesChart() {
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
      <h2 className="text-2xl font-bold text-white mb-2">
        📈 Visão Geral
      </h2>

      <p className="text-zinc-400 mb-6">
        Vendas dos últimos 30 dias
      </p>

      <div className="w-full min-h-[320px] h-[320px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={data}>

            <XAxis
              dataKey="day"
              stroke="#888"
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="vendas"
              stroke="#22c55e"
              strokeWidth={3}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}