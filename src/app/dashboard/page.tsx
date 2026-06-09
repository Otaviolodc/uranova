import AIInsights from "@/components/dashboard/AIInsights";
import TopProducts from "@/components/dashboard/TopProducts";
import RecentSales from "@/components/dashboard/RecentSales";
import SalesChart from "@/components/dashboard/SalesChart";
import QuickActions from "@/components/dashboard/QuickActions";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function DashboardPage() {
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatsCard
          title="💰 Receita Total"
          value="R$ 0"
          subtitle="+0% hoje"
        />

        <StatsCard
          title="🛒 Vendas"
          value="0"
          subtitle="Nenhuma venda"
        />

        <StatsCard
          title="📈 Conversão"
          value="0%"
          subtitle="Sem dados"
        />

        <StatsCard
          title="🎯 Ticket Médio"
          value="R$ 0"
          subtitle="Sem vendas"
        />

      </div>

      <QuickActions />

      <SalesChart />

      <RecentSales />

      <TopProducts />

      <AIInsights />

    </div>
  );
}