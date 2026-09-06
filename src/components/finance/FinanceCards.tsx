import BalanceCard from "@/components/finance/BalanceCard";
import { getUserFinancialSummary } from "@/lib/services/balance";

interface FinanceCardsProps {
  userId: string;
}

export default async function FinanceCards({
  userId,
}: FinanceCardsProps) {
  const balance = await getUserFinancialSummary(userId);

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      <BalanceCard
        title="Receita Bruta"
        value={balance?.total_gross ?? 0}
        color="blue"
      />

      <BalanceCard
        title="Comissão Uranova"
        value={balance?.total_platform_fee ?? 0}
        color="green"
      />

      <BalanceCard
        title="Taxas Stripe"
        value={balance?.total_stripe_fee ?? 0}
        color="yellow"
      />
    </div>
  );
}