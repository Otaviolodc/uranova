import FinanceCards from "@/components/finance/FinanceCards";
import FinancialHistory from "@/components/finance/FinancialHistory";
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

  const stripeConnected = Boolean(stripeAccountId);

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">
          Financeiro
        </h1>

        <p className="mt-3 text-base md:text-lg text-zinc-400">
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

      {/* HISTÓRICO FINANCEIRO */}
      <div className="mt-10">
        <FinancialHistory userId={user.id} />
      </div>
    </div>
  );
}