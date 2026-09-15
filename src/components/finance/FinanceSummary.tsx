import { getFinanceSummary } from "@/lib/services/finance-reader";

export const formatCents = (value: number) => (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function FinanceSummary({ userId }: { userId?: string }) {
  const s = await getFinanceSummary(userId);
  const cards: [string, number][] = [
    ["Vendas brutas (GMV)", s.gross_cents], ["Comissão Uranova", s.platform_fee_cents],
    ["Taxas Stripe", s.stripe_fee_cents], ["Líquido dos produtores", s.producer_net_cents],
    ["Disponível conciliado", s.available_cents], ["Saldo pendente", s.pending_cents],
    ["Saques em andamento", s.pending_payout_cents], ["Total sacado", s.withdrawn_cents],
  ];
  return <section className="space-y-5">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) =>
      <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-xl font-bold">{formatCents(value)}</p>
      </div>)}</div>
    <p className="text-zinc-400">{s.approved_sales} vendas verificadas · {s.unverified_payments} pagamentos históricos aguardando verificação.</p>
    {(s.reconciliation_required || s.unverified_payments > 0) && <p className="text-amber-300">Conciliação necessária. Valores ainda não verificados não autorizam saques. O disponível exige atualização nos últimos cinco minutos.</p>}
    <p className="text-sm text-zinc-500">Eventos Stripe: {s.failed_events} com erro de processamento · {s.pending_events} em processamento. Estornos e disputas exigem revisão; os totais de vendas mantêm o histórico bruto.</p>
  </section>;
}
