import {
  Package,
  DollarSign,
  CreditCard,
  Rocket,
  Wallet,
} from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Crie seu Produto",
    description:
      "Cadastre cursos, e-books, mentorias, assinaturas ou comunidades.",
  },
  {
    icon: DollarSign,
    title: "Defina seu Preço",
    description:
      "Configure pagamentos únicos, parcelamentos ou recorrências.",
  },
  {
    icon: CreditCard,
    title: "Receba Pagamentos",
    description:
      "Aceite PIX e outras formas de pagamento através do checkout.",
  },
  {
    icon: Rocket,
    title: "Entregue Automaticamente",
    description:
      "O acesso é liberado automaticamente após a compra.",
  },
  {
    icon: Wallet,
    title: "Solicite seus Saques",
    description:
      "Acompanhe seus ganhos e solicite saques com poucos cliques.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-32 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">

        <div className="text-center max-w-3xl mx-auto">

          <span className="text-violet-400 font-medium">
            Processo simples
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Comece a vender em minutos
          </h2>

          <p className="text-zinc-400 text-lg mt-6 leading-relaxed">
            A Uranova automatiza toda a operação para que
            você possa focar no crescimento do seu negócio.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mt-20">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="
                  glass
                  card-hover
                  rounded-[32px]
                  p-8
                  border
                  border-white/5
                  shadow-lg
                  shadow-black/20
                  relative
                "
              >

                <div className="absolute top-6 right-6 text-4xl font-bold text-violet-500/20">
                  {index + 1}
                </div>

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
                  {step.title}
                </h3>

                <p className="text-zinc-400 text-sm leading-relaxed">
                  {step.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

