"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart() {

  const [data, setData] =
  useState<any[]>([]);

  const [mounted, setMounted] =
  useState(false);

  async function fetchClicks() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: clicks } =
      await supabase
        .from("link_clicks_daily")
        .select("*")
        .eq("user_id", user.id)
        .order("date", {
          ascending: true,
        });

    const formatted =
      (clicks || []).map((item) => ({
        day: item.date?.slice(8, 10),
        clicks: item.clicks,
      }));

    setData(formatted);
  }

  useEffect(() => {
    fetchClicks();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

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
        Cliques dos últimos dias
      </p>

      <div className="w-full h-[320px]">

        <ResponsiveContainer
          width="99%"
          height={320}
        >

          <LineChart data={data}>

            <XAxis
              dataKey="day"
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#22c55e"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}