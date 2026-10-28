"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { linkStatistics, type LinkMetric } from "@/lib/link-statistics";

export default function StatsCharts({ links }: { links: LinkMetric[] }) {
  const stats = useMemo(() => linkStatistics(links), [links]);
  const displayed = stats.ranking.slice(0, 10);
  return <section className="bg-white text-zinc-900 p-6 rounded-lg shadow-md min-w-0">
    <h3 className="text-lg font-semibold mb-4">Estatísticas de links</h3>
    {!links.length ? <p role="status">Nenhum link disponível.</p> : <>
      {stats.missing > 0 && <p role="status">{stats.missing} link(s) sem contagem válida; não incluídos na média.</p>}
      {!displayed.length ? <p role="status">Contagens de cliques indisponíveis.</p> : <>
        <h4 className="text-sm font-medium mb-4">Cliques acumulados por link — até 10 resultados</h4>
        <div className="h-72 min-w-0" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayed} accessibilityLayer={false}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" tickFormatter={value => String(value).length > 15 ? `${String(value).slice(0, 15)}…` : String(value)} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={value => [`${value} cliques`, "Cliques"]} />
              <Bar dataKey="clicks" fill="#6366f1" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <caption className="text-left font-semibold py-3">Dados do gráfico</caption>
          <thead><tr><th scope="col">Link</th><th scope="col">Cliques</th></tr></thead>
          <tbody>{displayed.map(item => <tr key={item.id}><th scope="row" className="break-words font-normal py-2">{item.title}</th><td>{item.clicks.toLocaleString("pt-BR")}</td></tr>)}</tbody>
        </table></div>
        <p className="mt-4">Média por link com contagem conhecida: {stats.average?.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</p>
      </>}
      <p className="mt-4 text-zinc-600">Histórico diário indisponível: os totais acumulados não informam quando os cliques ocorreram.</p>
      <p className="text-zinc-600">Taxa de conversão indisponível: não há eventos e base de comparação definidos para esse indicador.</p>
    </>}
  </section>;
}
