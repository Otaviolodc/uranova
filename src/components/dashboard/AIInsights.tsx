export default function AIInsights() {
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

        <h2 className="text-2xl font-bold text-white">
          🤖 Insights IA
        </h2>

        <p className="text-zinc-400 mt-2">
          Recomendações inteligentes da sua operação
        </p>

      </div>

      <div className="grid md:grid-cols-2 gap-5 p-6">

        {/* MELHOR HORÁRIO */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            transition
          "
        >

          <p className="text-zinc-400 text-sm">
            📈 Melhor Horário
          </p>

          <h3 className="text-2xl font-black text-white mt-3">
            19h às 22h
          </h3>

          <p className="text-zinc-500 mt-3">
            Período com maior atividade dos usuários.
          </p>

        </div>

        {/* MELHOR PRODUTO */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            transition
          "
        >

          <p className="text-zinc-400 text-sm">
            🏆 Melhor Produto
          </p>

          <h3 className="text-2xl font-black text-white mt-3">
            Produto em Destaque
          </h3>

          <p className="text-zinc-500 mt-3">
            Maior potencial de vendas da operação.
          </p>

        </div>

        {/* CONVERSÃO */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            transition
          "
        >

          <p className="text-zinc-400 text-sm">
            🎯 Conversão
          </p>

          <h3 className="text-2xl font-black text-white mt-3">
            Crescimento constante
          </h3>

          <p className="text-zinc-500 mt-3">
            Continue enviando tráfego para os produtos principais.
          </p>

        </div>

        {/* SUGESTÃO */}
        <div
          className="
            bg-black
            border
            border-zinc-800
            rounded-3xl
            p-6
            hover:border-green-500/30
            transition
          "
        >

          <p className="text-zinc-400 text-sm">
            💡 Sugestão IA
          </p>

          <h3 className="text-2xl font-black text-white mt-3">
            Continue escalando
          </h3>

          <p className="text-zinc-500 mt-3">
            Seus produtos possuem potencial para aumentar as vendas.
          </p>

        </div>

      </div>

    </div>

  );
}