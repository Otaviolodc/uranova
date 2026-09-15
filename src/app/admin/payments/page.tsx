import Link from "next/link";
import FinanceSummary, { formatCents } from "@/components/finance/FinanceSummary";
import { getFinancePayments } from "@/lib/services/finance-reader";
import { requireFinanceAdmin } from "@/lib/finance/access";
import { admin } from "@/lib/supabase/admin";

export default async function PaymentsPage() {
  await requireFinanceAdmin();
  const payments = await getFinancePayments();
  const { data: events, error } = await admin.from("stripe_webhook_events")
    .select("event_id,event_type,status,last_error,created_at")
    .order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return <div className="space-y-8">
    <h1 className="text-3xl font-bold">Financeiro Uranova</h1>
    <FinanceSummary />
    <h2 className="text-xl">Últimas 100 vendas verificadas</h2>
    <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>
      <th>Pedido</th><th>Bruto</th><th>Uranova</th><th>Stripe</th><th>Produtor</th>
    </tr></thead><tbody>{payments.map((p) => <tr key={p.id} className="border-b border-zinc-800">
      <td className="py-3"><Link href={"/admin/payments/" + p.order_id}>{p.order_id.slice(0,8)}</Link></td>
      <td>{formatCents(p.gross_cents)}</td><td>{formatCents(p.platform_fee_cents)}</td>
      <td>{formatCents(p.stripe_fee_cents)}</td><td>{formatCents(p.producer_net_cents)}</td>
    </tr>)}</tbody></table></div>
    <h2 className="text-xl">Últimos 50 eventos Stripe</h2>
    <p className="text-zinc-400">Falhas de pagamento e sessões pendentes são eventos, sem crédito financeiro. Erro de processamento exige nova entrega ou conciliação.</p>
    {events?.map((e) => <div key={e.event_id} className="break-all border-b border-zinc-800 py-3 text-sm">
      {e.event_type} · {e.status} · {e.event_id}{e.last_error && <p className="text-amber-300">{e.last_error}</p>}
    </div>)}
  </div>;
}
