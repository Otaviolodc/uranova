import Link from "next/link";
import { requireFinanceUser } from "@/lib/finance/access";
import { admin } from "@/lib/supabase/admin";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const user = await requireFinanceUser();
  const { session_id } = await searchParams;
  const { data, error } = session_id ? await admin.from("payments").select("id")
    .eq("stripe_checkout_session_id", session_id).eq("customer_id", user.id).eq("finance_verified", true)
    .maybeSingle() : { data: null, error: null };
  if (error) throw new Error(error.message);
  return <main className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
    <div className="max-w-xl space-y-6 text-center">
      <h1 className="text-3xl font-bold">{data ? "Pagamento confirmado" : "Aguardando confirmação do pagamento"}</h1>
      <p>{data ? "Sua compra está registrada e o acesso foi liberado." : "O acesso será liberado após a confirmação da Stripe. Você pode consultar suas compras em instantes."}</p>
      <Link className="inline-block rounded-lg bg-green-700 p-4" href="/dashboard/customer/products">Consultar meus produtos</Link>
    </div>
  </main>;
}
