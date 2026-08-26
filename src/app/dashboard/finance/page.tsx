import WithdrawHistory from "@/components/finance/WithdrawHistory";
import FinanceCards from "@/components/finance/FinanceCards";
import FinancialHistory from "@/components/finance/FinancialHistory";
import WithdrawSection from "@/components/finance/WithdrawSection";
import StripeConnectButton from "@/components/finance/StripeConnectButton";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";

export default async function FinancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // ==========================================================
  // BUSCA A CONTA STRIPE DO PRODUTOR
  // ==========================================================

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();

  const stripeAccountId: string | null =
    profile?.stripe_account_id || null;

  // ==========================================================
  // STRIPE CONNECT
  // ==========================================================
  //
  // Não enviamos o objeto retornado pela Stripe para o
  // Client Component. Enviamos somente dados simples.
  //

  const stripeConnected = Boolean(
    stripeAccountId
  );

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">
          Financeiro
        </h1>

        <p className="mt-2 text-zinc-400">
          Resumo financeiro da sua operação
        </p>
      </div>

      {/* CARDS */}
      <FinanceCards userId={user.id} />

      {/* STRIPE CONNECT */}
      <div className="mt-8">
        <StripeConnectButton
          accountId={stripeAccountId}
          stripeConnected={stripeConnected}
        />
      </div>

      {/* BOTÃO DE SAQUE */}
      <div className="mt-8">
        <WithdrawSection userId={user.id} />
      </div>

      {/* HISTÓRICO */}
      <div className="mt-10">
        <FinancialHistory userId={user.id} />

        <WithdrawHistory userId={user.id} />
      </div>
    </div>
  );
}