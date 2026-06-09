export default function AIInsights() {
  return (
    <div
      className="
        mt-10
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
      "
    >
      <h2 className="text-2xl font-bold text-white mb-6">
        🤖 Insights IA
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <div className="bg-black border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            📈 Melhor Horário
          </p>

          <h3 className="text-xl font-bold text-white mt-2">
            19h às 22h
          </h3>

          <p className="text-zinc-500 mt-2">
            Maior volume de cliques.
          </p>
        </div>

        <div className="bg-black border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            🔥 Melhor Produto
          </p>

          <h3 className="text-xl font-bold text-white mt-2">
            Curso Dropshipping
          </h3>

          <p className="text-zinc-500 mt-2">
            32% mais acessado.
          </p>
        </div>

        <div className="bg-black border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            🎯 Melhor CTA
          </p>

          <h3 className="text-xl font-bold text-white mt-2">
            Acesse Agora
          </h3>

          <p className="text-zinc-500 mt-2">
            Melhor taxa de clique.
          </p>
        </div>

        <div className="bg-black border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            💡 Sugestão IA
          </p>

          <h3 className="text-xl font-bold text-white mt-2">
            Use títulos menores
          </h3>

          <p className="text-zinc-500 mt-2">
            Títulos curtos convertem mais.
          </p>
        </div>

      </div>
    </div>
  );
}