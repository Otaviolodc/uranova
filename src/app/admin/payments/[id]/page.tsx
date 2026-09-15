import { notFound } from "next/navigation";
import { admin } from "@/lib/supabase/admin";
import { requireFinanceAdmin } from "@/lib/finance/access";

interface PaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentPage({
  params,
}: PaymentPageProps) {
  await requireFinanceAdmin();
  const { id } = await params;

  const supabase = admin;

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id,
      amount,
      customer_name,
      customer_email,
      status,
      created_at
    `)
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }
  const { data: payment, error: paymentError } = await admin.from("payments")
    .select("finance_verified,stripe_checkout_session_id,payment_provider_id")
    .eq("order_id", id).maybeSingle();
  if (paymentError) throw new Error(paymentError.message);

  return (
    <div className="space-y-8">
      <p className={payment?.finance_verified ? "text-green-400" : "text-amber-300"}>
        {payment?.finance_verified ? "Venda verificada com Stripe Live" : "Pedido histórico: ainda não conciliado com Stripe Live. Não integra o saldo oficial."}
      </p>

      <div>

        <h1 className="text-4xl font-bold">
          Pedido #{order.id.slice(0, 8)}
        </h1>

        <p className="text-zinc-400 mt-2">
          Detalhes do pagamento
        </p>

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <h2 className="text-xl font-bold mb-6">
          Informações do pagamento
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <p className="text-zinc-500 text-sm">
              Valor
            </p>

            <p>
              R$ {Number(order.amount).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">
              Status
            </p>

            <p>{order.status}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">
              Cliente
            </p>

            <p>{order.customer_name}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">
              E-mail
            </p>

            <p>{order.customer_email}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">
              Data
            </p>

            <p>
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString("pt-BR")
                : "-"}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
