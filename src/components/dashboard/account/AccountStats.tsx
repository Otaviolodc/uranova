import StatCard from "@/components/dashboard/shared/StatCard";

type AccountStatsProps = {
  products: number;
  customers: number;
  sales: number;
  isPro: boolean;
};

export default function AccountStats({
  products,
  customers,
  sales,
  isPro,
}: AccountStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Produtos"
        value={products}
        icon="📦"
      />

      <StatCard
        title="Clientes"
        value={customers}
        icon="👥"
      />

      <StatCard
        title="Vendas"
        value={`R$ ${sales.toFixed(2)}`}
        icon="💰"
      />

      <StatCard
        title="Plano"
        value={isPro ? "PRO" : "FREE"}
        icon="💎"
        color={isPro ? "purple" : "green"}
      />
    </div>
  );
}