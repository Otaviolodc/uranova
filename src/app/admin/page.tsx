import AdminCard from "@/components/admin/AdminCard";
import { admin } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const supabase = admin;

  // ======================================================
  // USUÁRIOS
  // ======================================================

  const { count: users } = await supabase
    .from("profiles")
    .select("*", {
      count: "exact",
      head: true,
    });

  // ======================================================
  // PRODUTOS
  // ======================================================

  const { count: marketplaceProducts } = await supabase
    .from("products")
    .select("*", {
      count: "exact",
      head: true,
    });

  // ======================================================
  // PEDIDOS
  // ======================================================

  const { count: orders } = await supabase
    .from("orders")
    .select("*", {
      count: "exact",
      head: true,
    });

  // ======================================================
  // PEDIDOS PAGOS
  // ======================================================

  const { data: paidOrders } = await supabase
    .from("orders")
    .select("amount")
    .eq("status", "PAID");

  // ======================================================
  // FATURAMENTO
  // ======================================================

  const revenue =
    paidOrders?.reduce(
      (total, order) => total + Number(order.amount),
      0
    ) ?? 0;

  // ======================================================
  // VENDAS PAGAS
  // ======================================================

  const paidOrdersCount = paidOrders?.length ?? 0;

  // ======================================================
  // TICKET MÉDIO
  // ======================================================

  const averageTicket =
    paidOrdersCount > 0
      ? revenue / paidOrdersCount
      : 0;

  // ======================================================
  // FORMATAÇÃO DE MOEDA
  // ======================================================

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  return (
    <div className="space-y-12">

      {/* ==================================================
          HERO
      ================================================== */}

      <section>
        <span
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-green-500/20
            bg-green-500/10
            px-4
            py-2
            text-sm
            font-semibold
            text-green-400
          "
        >
          🛡️ Painel Administrativo
        </span>

        <h1
          className="
            mt-5
            text-4xl
            font-black
            tracking-tight
            md:text-6xl
          "
        >
          Bem-vindo, Admin 👋
        </h1>

        <p
          className="
            mt-4
            max-w-3xl
            text-base
            leading-relaxed
            text-zinc-400
            md:text-lg
          "
        >
          Centro de controle da Uranova.
          Acompanhe usuários, produtos, pedidos,
          faturamento e o desempenho da plataforma.
        </p>
      </section>

      {/* ==================================================
          INDICADORES
      ================================================== */}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Visão geral
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Indicadores atuais da plataforma
            </p>
          </div>

          <div
            className="
              hidden
              items-center
              gap-2
              rounded-full
              border
              border-zinc-800
              bg-zinc-900
              px-3
              py-2
              text-xs
              text-zinc-400
              md:flex
            "
          >
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Dados em tempo real
          </div>
        </div>

        <div
          className="
            grid
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          <AdminCard
            icon="👥"
            title="Usuários"
            description="Contas cadastradas"
            value={users ?? 0}
          />

          <AdminCard
            icon="📦"
            title="Produtos"
            description="Produtos publicados"
            value={marketplaceProducts ?? 0}
          />

          <AdminCard
            icon="🛒"
            title="Pedidos"
            description="Pedidos registrados"
            value={orders ?? 0}
          />

          <AdminCard
            icon="💰"
            title="Faturamento"
            description="Pedidos pagos"
            value={formatCurrency(revenue)}
            valueColor="text-green-400"
          />

          <AdminCard
            icon="💳"
            title="Vendas pagas"
            description="Transações concluídas"
            value={paidOrdersCount}
          />

          <AdminCard
            icon="🎯"
            title="Ticket médio"
            description="Valor médio por venda"
            value={formatCurrency(averageTicket)}
            valueColor="text-green-400"
          />
        </div>
      </section>

      {/* ==================================================
          STATUS DA PLATAFORMA
      ================================================== */}

      <section>
        <h2 className="mb-5 text-xl font-bold">
          Status da plataforma
        </h2>

        <div
          className="
            grid
            gap-5
            md:grid-cols-2
          "
        >
          <div
            className="
              rounded-3xl
              border
              border-green-500/20
              bg-zinc-900
              p-6
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Sistema
                </p>

                <h3 className="mt-2 text-2xl font-black text-green-400">
                  Operacional
                </h3>
              </div>

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-green-500/10
                "
              >
                🟢
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              A Uranova está funcionando normalmente.
            </p>
          </div>

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-900
              p-6
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Atividade comercial
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  {paidOrdersCount > 0
                    ? "Ativa"
                    : "Sem vendas pagas"}
                </h3>
              </div>

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-zinc-950
                  text-xl
                "
              >
                📈
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              Baseado nas transações pagas registradas.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          RESUMO
      ================================================== */}

      <section>
        <h2 className="mb-5 text-xl font-bold">
          📋 Resumo da Uranova
        </h2>

        <div
          className="
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-900
            p-6
            md:p-8
          "
        >
          <div className="grid gap-6 md:grid-cols-2">

            <div className="space-y-5">

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  Usuários cadastrados
                </span>

                <span className="font-bold">
                  {users ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  Produtos publicados
                </span>

                <span className="font-bold">
                  {marketplaceProducts ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  Pedidos realizados
                </span>

                <span className="font-bold">
                  {orders ?? 0}
                </span>
              </div>

            </div>

            <div className="space-y-5">

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  Vendas pagas
                </span>

                <span className="font-bold">
                  {paidOrdersCount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  Faturamento
                </span>

                <span className="font-bold text-green-400">
                  {formatCurrency(revenue)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  Ticket médio
                </span>

                <span className="font-bold text-green-400">
                  {formatCurrency(averageTicket)}
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}