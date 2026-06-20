import {
  Shield,
  BarChart3,
  Wallet,
  LifeBuoy,
  Cloud,
} from "lucide-react";

export default function TrustBar() {
  const items = [
    {
      icon: Shield,
      label: "Pagamentos Seguros",
    },
    {
      icon: Wallet,
      label: "PIX Instantâneo",
    },
    {
      icon: BarChart3,
      label: "Analytics em Tempo Real",
    },
    {
      icon: LifeBuoy,
      label: "Suporte Especializado",
    },
    {
      icon: Cloud,
      label: "Infraestrutura em Nuvem",
    },
  ];

  return (
    <section className="border-y border-white/5 bg-black/30 backdrop-blur-xl">

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="flex flex-wrap justify-center gap-12">

          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="
                  flex
                  items-center
                  gap-3
                  text-zinc-300
                  hover:text-white
                  transition
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-violet-500/10
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Icon
                    size={18}
                    className="text-violet-400"
                  />
                </div>

                <span className="text-sm md:text-base">
                  {item.label}
                </span>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}

