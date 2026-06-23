type Insight = {
  icon: string;
  title: string;
  headline: string;
  description: string;
};

const insights: Insight[] = [
  {
    icon: "📈",
    title: "Melhor Horário",
    headline: "19h às 22h",
    description:
      "Período com maior atividade dos usuários.",
  },
  {
    icon: "🏆",
    title: "Melhor Produto",
    headline: "Produto em Destaque",
    description:
      "Maior potencial de vendas da operação.",
  },
  {
    icon: "🎯",
    title: "Conversão",
    headline: "Crescimento constante",
    description:
      "Continue enviando tráfego para os produtos principais.",
  },
  {
    icon: "💡",
    title: "Sugestão IA",
    headline: "Continue escalando",
    description:
      "Seus produtos possuem potencial para aumentar as vendas.",
  },
];

export default function AllInsights() {
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
        {insights.map((item) => (
          <div
            key={item.title}
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
              {item.icon} {item.title}
            </p>

            <h3 className="text-2xl font-black text-white mt-3">
              {item.headline}
            </h3>

            <p className="text-zinc-500 mt-3">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}