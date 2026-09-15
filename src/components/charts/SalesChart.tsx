"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
type Point = { date: string; label: string; revenue: number; sales: number };
export default function SalesChart() {
  const [period, setPeriod] = useState("7d");
  const [data, setData] = useState<Point[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/finance/chart?period=" + period, { signal: controller.signal })
      .then(async (r) => { if (!r.ok) throw new Error("Não foi possível carregar as vendas."); return r.json(); })
      .then((r) => { setData(r.data); setError(""); })
      .catch((e) => { if (e.name !== "AbortError") { setData([]); setError(e.message); } });
    return () => controller.abort();
  }, [period]);
  return <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
    <div className="mb-5 flex justify-between gap-4"><h2 className="text-xl font-bold">Vendas Stripe Live</h2>
      <select aria-label="Período" className="rounded bg-zinc-800 p-2" value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="7d">7 dias</option><option value="30d">30 dias</option><option value="90d">90 dias</option><option value="12m">12 meses</option>
      </select></div>
    {error ? <p role="alert">{error}</p> : <div className="h-72"><ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}><XAxis dataKey="label" /><YAxis /><Tooltip formatter={(v) => Number(v).toLocaleString("pt-BR", {style:"currency",currency:"BRL"})} />
        <Area type="monotone" dataKey="revenue" name="Vendas brutas" stroke="#22c55e" fill="#14532d" />
      </AreaChart>
    </ResponsiveContainer></div>}
  </section>;
}
