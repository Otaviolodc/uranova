import FinanceCards from "@/components/finance/FinanceCards";
import FinancialHistory from "@/components/finance/FinancialHistory";
import WithdrawButton from "@/components/finance/WithdrawButton";
import { createClient } from "@/lib/supabase/server";

export default async function FinancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">
          Financeiro
        </h1>

        <p className="text-zinc-400 mt-2">
          Resumo financeiro da sua operação
        </p>
      </div>

      {/* CARDS */}
      <FinanceCards userId={user.id} />

      {/* BOTÃO DE SAQUE */}
      <div className="mt-8">
        <WithdrawButton />
      </div>

      {/* HISTÓRICO */}
      <div className="mt-10">
        <FinancialHistory userId={user.id} />
      </div>
    </div>
  );
}