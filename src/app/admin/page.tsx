import { requireAdminPage } from "@/lib/security/admin-page";
import { getFinanceSummary } from "@/lib/services/finance-reader";
import AdminCard from "@/components/admin/AdminCard";
import { getAdminProductCatalog, getAdminRecordCount } from "@/lib/services/admin-products";

export default async function AdminPage() {
  await requireAdminPage();
  const summary = await getFinanceSummary();
  const [catalog, users, orders] = await Promise.all([
    getAdminProductCatalog(), getAdminRecordCount("profiles"), getAdminRecordCount("orders"),
  ]);
  const productCounts = catalog?.counts;

  const revenue = summary.gross_cents / 100;
  const paidOrdersCount = summary.approved_sales;
  const averageTicket = paidOrdersCount ? revenue / paidOrdersCount : 0;

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

      {(!catalog || users === null || orders === null) && (
        <div role="alert" className="rounded-2xl border border-amber-500/30 bg-zinc-900 p-5 text-zinc-300">
          Não foi possível carregar todos os indicadores. Valores indisponíveis aparecem como “—”. Recarregue a página para tentar novamente.
        </div>
      )}

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
            Dados consultados ao carregar
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
            value={users ?? "—"}
          />

          <AdminCard
            icon="📦"
            title="Produtos cadastrados"
            description="Registros atuais e históricos"
            value={productCounts?.registered ?? "—"}
          />

          <AdminCard icon="✓" title="Produtos com checkout ativo" description="Produtos distintos com checkout ativo" value={productCounts?.active ?? "—"} />
          <AdminCard icon="🌐" title="Publicados no Marketplace" description="Produtos distintos com publicação ativa" value={productCounts?.marketplace ?? "—"} />
          <AdminCard icon="📁" title="Produtos sem checkout" description="Cadastros sem checkout vinculado" value={productCounts?.withoutCheckout ?? "—"} />

          <AdminCard
            icon="🛒"
            title="Pedidos"
            description="Pedidos registrados"
            value={orders ?? "—"}
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
          Sobre os indicadores
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
                  Atualização
                </p>

                <h3 className="mt-2 text-2xl font-black text-green-400">
                  Ao carregar a página
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
                ℹ
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              Os números refletem as consultas desta página. Não há monitoramento automático de disponibilidade.
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
                  {users ?? "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  Produtos cadastrados
                </span>

                <span className="font-bold">
                  {productCounts?.registered ?? "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">
                  Pedidos realizados
                </span>

                <span className="font-bold">
                  {orders ?? "—"}
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
