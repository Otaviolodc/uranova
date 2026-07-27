import AdminCard from "@/components/admin/AdminCard";
import { createClient } 
from "@/lib/supabase/server";

export default async function AdminPage() {

  const supabase =
    await createClient();

  // USERS
  const { count: users } = await supabase
    .from("profiles")
    .select("*", {
      count: "exact",
      head: true,
    });

  // MARKETPLACE PRODUCTS
  const { count: marketplaceProducts } = await supabase
    .from("products")
    .select("*", {
      count: "exact",
      head: true,
    });

    // RECEITA
  const { data: paidOrders } = await supabase
    .from("orders")
    .select("amount")
    .eq("status", "PAID");

  const revenue =
    paidOrders?.reduce(
      (total, order) => total + Number(order.amount),
      0
    ) ?? 0;

    // PEDIDOS
  const { count: orders } = await supabase
    .from("orders")
    .select("*", {
      count: "exact",
      head: true,
    });

  return (

    <div>

      {/* HEADER */}
<div className="mb-12">

  <span
    className="
      inline-flex
      items-center
      rounded-full
      bg-green-500/10
      border
      border-green-500/20
      px-4
      py-2
      text-sm
      font-semibold
      text-green-400
      mb-5
    "
  >
    🛡 Painel Administrativo
  </span>

  <h1
    className="
      text-4xl
      md:text-6xl
      font-black
      tracking-tight
    "
  >
    Bem-vindo, Admin 👋
  </h1>

  <p
    className="
      mt-4
      max-w-2xl
      text-zinc-400
      text-lg
      leading-relaxed
    "
  >
    Controle usuários, produtos, vendas e acompanhe os principais indicadores da plataforma Uranova em tempo real.
  </p>

</div>

      {/* CARDS */}
      <div className="
        grid
        md:grid-cols-2
        xl:grid-cols-3
        gap-6
      ">

        <AdminCard
          icon="👥"
          title="Usuários"
          value={users ?? 0}
        />

        <AdminCard
          icon="📦"
          title="Produtos"
          value={marketplaceProducts ?? 0}
        />

        <AdminCard
          icon="💳"
          title="Pedidos"
          value={orders ?? 0}
        />

        <AdminCard
          icon="💰"
          title="Receita"
          value={`R$ ${revenue.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`}
          valueColor="text-green-400"
        />

        <AdminCard
          icon="🟢"
          title="Sistema"
          value="Online"
          valueColor="text-green-400"
        />

      </div>

    {/* RESUMO */}
<div className="mt-10">

  <h2 className="text-2xl font-bold mb-6">
    📋 Resumo da Plataforma
  </h2>

  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

    <div className="grid md:grid-cols-2 gap-6">

      <div className="space-y-4">

        <div className="flex justify-between">
          <span className="text-zinc-400">
            Usuários cadastrados
          </span>

          <span className="font-bold">
            {users ?? 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">
            Produtos publicados
          </span>

          <span className="font-bold">
            {marketplaceProducts ?? 0}
          </span>
        </div>

      </div>

      <div className="space-y-4">

        <div className="flex justify-between">
          <span className="text-zinc-400">
            Pedidos realizados
          </span>

          <span className="font-bold">
            {orders ?? 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">
            Receita total
          </span>

          <span className="font-bold text-green-400">
            R$ {revenue.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">
            Status do sistema
          </span>

          <span className="text-green-400 font-bold">
            🟢 Operacional
          </span>
        </div>

      </div>

    </div>

  </div>

</div>

</div>

  );

}