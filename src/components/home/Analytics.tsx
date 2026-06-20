import {
  BarChart3,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function Analytics() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center max-w-3xl mx-auto">

          <span className="text-violet-400 font-medium">
            Analytics avançado
          </span>

          <h2 className="text-5xl font-bold mt-4">
            Tome decisões com dados reais
          </h2>

          <p className="text-zinc-400 text-lg mt-6">
            Acompanhe vendas, conversões, cliques,
            faturamento e desempenho dos seus produtos
            em tempo real.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-12 mt-20">

          {/* DASHBOARD */}
          <div className="glass rounded-3xl p-8">

            <div className="flex items-center justify-between mb-8">

              <div>
                <h3 className="text-2xl font-bold">
                  Visão Geral
                </h3>

                <p className="text-zinc-400">
                  Últimos 30 dias
                </p>
              </div>

              <BarChart3 className="text-violet-400" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">

              <Metric
                icon={<DollarSign size={18} />}
                value="R$ 12.847"
                label="Receita"
              />

              <Metric
                icon={<ShoppingCart size={18} />}
                value="324"
                label="Vendas"
              />

              <Metric
                icon={<MousePointerClick size={18} />}
                value="8.421"
                label="Cliques"
              />

              <Metric
                icon={<TrendingUp size={18} />}
                value="3.8%"
                label="Conversão"
              />

            </div>

            {/* gráfico */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/5">

              <div className="flex justify-between mb-5">
                <span className="text-zinc-400">
                  Crescimento Mensal
                </span>

                <span className="text-green-400">
                  +18%
                </span>
              </div>

              <div className="flex items-end gap-3 h-44">

                <div className="w-full h-16 bg-violet-600/30 rounded-t-xl" />
                <div className="w-full h-20 bg-violet-600/40 rounded-t-xl" />
                <div className="w-full h-24 bg-violet-600/50 rounded-t-xl" />
                <div className="w-full h-32 bg-violet-600/60 rounded-t-xl" />
                <div className="w-full h-28 bg-violet-600/70 rounded-t-xl" />
                <div className="w-full h-40 bg-violet-600 rounded-t-xl" />

              </div>

            </div>

          </div>

          {/* TEXTO */}
          <div className="flex flex-col justify-center">

            <span className="text-violet-400 font-medium">
              Inteligência de Negócios
            </span>

            <h3 className="text-4xl font-bold mt-4 leading-tight">
              Descubra exatamente o que gera mais vendas.
            </h3>

            <p className="text-zinc-400 text-lg mt-6 leading-relaxed">
              Saiba quais links recebem mais cliques,
              quais produtos convertem melhor e como
              aumentar sua receita utilizando dados reais.
            </p>

            <div className="mt-10 space-y-5">

              <Benefit text="Monitoramento em tempo real" />
              <Benefit text="Relatórios detalhados" />
              <Benefit text="Análise de conversão" />
              <Benefit text="Desempenho por produto" />
              <Benefit text="Histórico completo de vendas" />

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
      <div className="text-violet-400 mb-2">
        {icon}
      </div>

      <div className="text-2xl font-bold">
        {value}
      </div>

      <div className="text-zinc-400 text-sm mt-1">
        {label}
      </div>
    </div>
  );
}

function Benefit({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-violet-500" />
      <span>{text}</span>
    </div>
  );
}