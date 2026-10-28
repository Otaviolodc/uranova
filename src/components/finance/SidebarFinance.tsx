import { getUserFinancialSummary } from "@/lib/services/balance";
import AchievementProgress from "@/components/dashboard/AchievementProgress";
import ReadRetry from "./ReadRetry";
import { rethrowAccessError } from "./presentation-errors";

export default async function SidebarFinance({ userId }: { userId: string }) {
  let balance;
  try {
    balance = await getUserFinancialSummary(userId);
  } catch (error) {
    rethrowAccessError(error);
    return <div role="status" className="rounded-xl border border-zinc-700 p-3 text-sm">
      <p>Resumo financeiro indisponível</p><ReadRetry />
    </div>;
  }
  return <AchievementProgress totalEarned={balance.total_net} />;
}
