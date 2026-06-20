import {
  LayoutDashboard,
  Wallet,
  Users,
  Link2,
  BarChart3,
  LifeBuoy,
  CreditCard,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Inteligente",
    description:
      "Acompanhe vendas, cliques, conversões e desempenho em tempo real.",
  },
  {
    icon: Wallet,
    title: "Saques Simplificados",
    description:
      "Solicite saques dos seus ganhos de forma rápida e segura.",
  },
  {
    icon: Users,
    title: "Área de Membros",
    description:
      "Entregue cursos, mentorias e conteúdos exclusivos para seus alunos.",
  },
  {
    icon: Link2,
    title: "Linktree Profissional",
    description:
      "Centralize todos os seus links, produtos e ofertas em uma única página.",
  },
  {
    icon: BarChart3,
    title: "Analytics Avançado",
    description:
      "Descubra quais campanhas e produtos geram mais resultados.",
  },
  {
    icon: LifeBuoy,
    title: "Suporte Especializado",
    description:
      "Conte com suporte dedicado para ajudar no crescimento do seu negócio.",
  },
  {
    icon: CreditCard,
    title: "Checkout Integrado",
    description:
      "Receba pagamentos via PIX e cartões de forma simples e segura.",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description:
      "Infraestrutura protegida para garantir estabilidade e segurança.",
  },
];

export default function Features() {
  return (
    <section
      id="recursos"
      className="py-32 px-6"
    >
      <div className="max-w-7xl mx-auto">

        <div className="text-center max-w-3xl mx-auto">

          <span className="text-violet-400 font-medium">
            Recursos completos
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Tudo que você precisa
            para vender online
          </h2>

          <p className="text-zinc-400 mt-6 text-lg leading-relaxed">
            A Uranova reúne todas as ferramentas necessárias
            para criar, vender, entregar e escalar produtos digitais.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="
                  glass
                  card-hover
                  rounded-[32px]
                  p-8
                  border
                  border-white/5
                  shadow-lg
                  shadow-black/20
                "
              >

                <div
                  className="
                    w-16
                    h-16
                    rounded-2xl
                    bg-violet-500/10
                    flex
                    items-center
                    justify-center
                    mb-6
                  "
                >
                  <Icon
                    size={30}
                    className="text-violet-400"
                  />
                </div>

                <h3 className="text-xl font-bold mb-4">
                  {feature.title}
                </h3>

                <p className="text-zinc-400 leading-relaxed text-sm">
                  {feature.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

