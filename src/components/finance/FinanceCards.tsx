import FinanceSummary from "./FinanceSummary";
export default function FinanceCards({ userId }: { userId: string }) {
  return <FinanceSummary userId={userId} />;
}
