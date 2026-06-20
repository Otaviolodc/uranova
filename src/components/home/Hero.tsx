import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Users,
  MousePointer,
  BookOpen,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/20 blur-[180px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* ESQUERDA */}
          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 px-4 py-2 rounded-full text-violet-300 text-sm">
              Plataforma completa para criadores digitais
            </div>

            <h1 className="mt-8 text-4xl md:text-5xl xl:text-6xl font-bold leading-tight">
              Venda{" "}
              <span className="gradient-text">
              Cursos, E-books
              </span>
              <br />
              e Assinaturas
              <br />
              em um só lugar.
            </h1>
    
            <p className="text-zinc-400 text-lg mt-8 max-w-2xl leading-relaxed">
              Crie sua página profissional, venda cursos,
              e-books, mentorias e assinaturas, entregue
              conteúdos exclusivos e acompanhe seus resultados
              em tempo real dentro da Uranova.
            </p>

            {/* BOTÕES */}
            <div className="flex flex-wrap gap-4 mt-10">

              <Link
                href="/login"
                className="
                  bg-violet-600
                  hover:bg-violet-700
                  transition
                  px-7
                  py-4
                  rounded-xl
                  font-semibold
                  flex
                  items-center
                  gap-2
                "
              >
                Criar Conta Grátis
                <ArrowRight size={18} />
              </Link>

              <button
                className="
                  border
                  border-zinc-700
                  hover:border-zinc-500
                  px-7
                  py-4
                  rounded-xl
                  transition
                "
              >
                Ver Demonstração
              </button>

            </div>

            {/* BENEFÍCIOS */}
            <div className="flex flex-wrap gap-6 mt-8 text-sm text-zinc-400">

              <span>✓ Área de membros integrada</span>

              <span>✓ Checkout próprio</span>

              <span>✓ Saques simplificados</span>

              <span>✓ Página de links profissional</span>

            </div>

            {/* DESTAQUES */}
            <div className="flex flex-wrap gap-8 mt-12">

              <div>
                <div className="text-xl font-bold">
                  Cursos
                </div>

                <div className="text-zinc-400">
                  Área de membros completa
                </div>
              </div>

              <div>
                <div className="text-xl font-bold">
                  PIX
                </div>

                <div className="text-zinc-400">
                  Recebimentos automáticos
                </div>
              </div>

              <div>
                <div className="text-xl font-bold">
                  Links
                </div>

                <div className="text-zinc-400">
                  Página profissional
                </div>
              </div>

            </div>

          </div>

          {/* DIREITA */}
          <div>

            <div className="w-full">

              <div className="flex items-center justify-between mb-8">

                <h3 className="text-2xl font-bold">
                  Dashboard Uranova
                </h3>

                <span className="text-green-400 text-sm">
                  ● Online
                </span>

              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">

                <MetricCard
                  icon={<TrendingUp size={18} />}
                  title="Receita"
                  value="R$ 12.847"
                />

                <MetricCard
                  icon={<Users size={18} />}
                  title="Vendas"
                  value="324"
                />

                <MetricCard
                  icon={<MousePointer size={18} />}
                  title="Cliques"
                  value="8.421"
                />

                <MetricCard
                  icon={<BookOpen size={18} />}
                  title="Produtos"
                  value="18"
                />

              </div>

              {/* GRÁFICO */}
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5">

                <div className="flex justify-between mb-5">

                  <span className="text-zinc-400">
                    Crescimento Mensal
                  </span>

                  <span className="text-green-400">
                    +18%
                  </span>

                </div>

                <div className="flex items-end gap-3 h-40">

                  <div className="w-full bg-violet-600/30 rounded-t-xl h-10" />

                  <div className="w-full bg-violet-600/40 rounded-t-xl h-16" />

                  <div className="w-full bg-violet-600/50 rounded-t-xl h-20" />

                  <div className="w-full bg-violet-600/60 rounded-t-xl h-28" />

                  <div className="w-full bg-violet-600/70 rounded-t-xl h-24" />

                  <div className="w-full bg-violet-600 rounded-t-xl h-36" />

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

function MetricCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-5">

      <div className="text-violet-400 mb-3">
        {icon}
      </div>

      <p className="text-zinc-400 text-sm">
        {title}
      </p>

      <p className="text-2xl font-bold mt-1">
        {value}
      </p>

    </div>
  );
}