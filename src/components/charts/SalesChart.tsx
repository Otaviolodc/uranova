"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SalesChart() {

  const [data, setData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  async function fetchSales() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: true,
      });

    const grouped: any = {};

    (orders || []).forEach((order) => {

      const day =
        order.created_at?.slice(8, 10);

      if (!grouped[day]) {
        grouped[day] = 0;
      }

      grouped[day] += Number(order.amount);

    });

    const formatted = Object.entries(grouped).map(
      ([day, revenue]) => ({
        day,
        revenue,
      })
    );

    setData(formatted);
  }

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (

    <div
      className="
        mt-10
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-8
      "
    >

      <h2 className="text-2xl font-bold text-white mb-2">
        📈 Receita dos últimos dias
      </h2>

      <p className="text-zinc-400 mb-8">
        Evolução das vendas da sua operação
      </p>

      <div className="w-full h-[350px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart data={data}>

            <CartesianGrid
              stroke="#27272a"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke="#71717a"
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={4}
              dot={{ r: 4 }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  );
}