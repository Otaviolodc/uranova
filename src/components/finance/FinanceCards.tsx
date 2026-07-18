import BalanceCard from "@/components/finance/BalanceCard";
import { getUserBalance } from "@/lib/services/balance";

interface FinanceCardsProps {
  userId: string;
}

export default async function FinanceCards({
  userId,
}: FinanceCardsProps) {
  const balance = await getUserBalance(userId);

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
      <BalanceCard
        title="Saldo Disponível"
        value={balance?.available_balance ?? 0}
        color="green"
      />

      <BalanceCard
        title="Saldo Pendente"
        value={balance?.pending_balance ?? 0}
        color="yellow"
      />

      <BalanceCard
        title="Total Recebido"
        value={balance?.total_earned ?? 0}
        color="blue"
      />

      <BalanceCard
        title="Total Sacado"
        value={balance?.total_withdrawn ?? 0}
        color="red"
      />
    </div>
  );
}