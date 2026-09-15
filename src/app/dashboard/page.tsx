import { requireFinanceUser } from "@/lib/finance/access";
import { getFinanceSummary } from "@/lib/services/finance-reader";
import TopProducts from "@/components/dashboard/TopProducts";
import RecentSales from "@/components/dashboard/RecentSales";
import SalesChart from "@/components/charts/SalesChart";
import QuickActions from "@/components/dashboard/QuickActions";
import { StatsCard } from "@/components/dashboard/StatsCard";


export default async function DashboardPage() {
  const user = await requireFinanceUser();
  const summary = await getFinanceSummary(user.id);
  const revenue = summary.gross_cents / 100;
  const sales = summary.approved_sales;
  const ticket = sales ? revenue / sales : 0;
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

    </div>
  );
}
