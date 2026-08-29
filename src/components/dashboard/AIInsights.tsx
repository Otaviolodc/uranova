"use client";

type OperationSummary = {
  sales: number;
  revenue: number;
  ticket: number;
  topProduct: string;
};

type AIInsightsProps = {
  summary?: OperationSummary;
};

export default function AIInsights({
  summary,
}: AIInsightsProps) {
  const sales = summary?.sales ?? 0;
  const revenue = summary?.revenue ?? 0;
  const ticket = summary?.ticket ?? 0;
  const topProduct =
    summary?.topProduct ?? "Nenhum produto";

  return (
    <div
      className="
        mt-10
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        overflow-hidden
      "
    >
      {/* HEADER */}
      <div
        className="
          p-6
          border-b
          border-zinc-800
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          📊 Resumo da Operação
        </h2>

        <p className="text-zinc-400 mt-2">
          Visão geral dos principais indicadores da sua operação
        </p>
      </div>

      {/* INDICADORES */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 p-6">

        {/* VENDAS */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            hover:-translate-y-1
            transition-all
            duration-300
          "
        >
          <p className="text-zinc-400 text-sm">
            🛒 Vendas aprovadas
          </p>

          <h3
            className="
              text-3xl
              font-black
              text-white
              mt-3
            "
          >
            {sales}
          </h3>

          <p className="text-zinc-500 text-sm mt-2">
            Total de vendas realizadas
          </p>
        </div>

        {/* RECEITA */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            hover:-translate-y-1
            transition-all
            duration-300
          "
        >
          <p className="text-zinc-400 text-sm">
            💰 Receita gerada
          </p>

          <h3
            className="
              text-3xl
              font-black
              text-green-400
              mt-3
            "
          >
            {revenue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </h3>

          <p className="text-zinc-500 text-sm mt-2">
            Receita acumulada
          </p>
        </div>

        {/* TICKET MÉDIO */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            hover:-translate-y-1
            transition-all
            duration-300
          "
        >
          <p className="text-zinc-400 text-sm">
            🎯 Ticket médio
          </p>

          <h3
            className="
              text-3xl
              font-black
              text-white
              mt-3
            "
          >
            {ticket.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </h3>

          <p className="text-zinc-500 text-sm mt-2">
            Valor médio por venda
          </p>
        </div>

        {/* PRODUTO CAMPEÃO */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            hover:-translate-y-1
            transition-all
            duration-300
          "
        >
          <p className="text-zinc-400 text-sm">
            🏆 Produto campeão
          </p>

          <h3
            className="
              text-xl
              font-black
              text-white
              mt-3
              line-clamp-2
            "
          >
            {topProduct}
          </h3>

          <p className="text-zinc-500 text-sm mt-2">
            Produto com mais vendas
          </p>
        </div>

      </div>
    </div>
  );
}