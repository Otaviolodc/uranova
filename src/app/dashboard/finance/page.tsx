import FinanceCards from "@/components/finance/FinanceCards";
import FinancialHistory from "@/components/finance/FinancialHistory";
import StripeConnectButton from "@/components/finance/StripeConnectButton";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import PayoutForm from "@/components/finance/PayoutForm";
import { getFinancePayouts } from "@/lib/services/finance-reader";
import { formatCents } from "@/components/finance/FinanceSummary";

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
  const payouts = await getFinancePayouts(user.id);

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
      <div className="mt-8"><PayoutForm /></div>
      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">Últimos 100 saques</h2>
        {payouts.map((p) => <p key={p.id}>{formatCents(p.amount_cents)} · {p.status} · {new Date(p.requested_at).toLocaleDateString("pt-BR")}</p>)}
      </section>

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
