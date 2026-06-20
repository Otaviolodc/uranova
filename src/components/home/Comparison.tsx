import {
  Check,
  X,
  Layers,
} from "lucide-react";

const comparisons = [
  {
    feature: "Página de Links",
    uranova: true,
    outros: true,
  },
  {
    feature: "Área de Membros",
    uranova: true,
    outros: false,
  },
  {
    feature: "Venda de Cursos",
    uranova: true,
    outros: false,
  },
  {
    feature: "Venda de E-books",
    uranova: true,
    outros: false,
  },
  {
    feature: "Mentorias",
    uranova: true,
    outros: false,
  },
  {
    feature: "Assinaturas Recorrentes",
    uranova: true,
    outros: false,
  },
  {
    feature: "Analytics Avançado",
    uranova: true,
    outros: false,
  },
  {
    feature: "Checkout Integrado",
    uranova: true,
    outros: false,
  },
  {
    feature: "Saques",
    uranova: true,
    outros: false,
  },
];

export default function Comparison() {
  return (
    <section className="py-32 px-6 bg-zinc-950">
      <div className="max-w-6xl mx-auto">

        <div className="text-center max-w-3xl mx-auto">

          <span className="text-violet-400 font-medium">
            Tudo em um só lugar
          </span>

          <h2 className="text-5xl font-bold mt-4">
            Pare de pagar várias plataformas
          </h2>

          <p className="text-zinc-400 text-lg mt-6">
            Enquanto outras ferramentas resolvem apenas
            uma parte do problema, a Uranova reúne tudo
            que você precisa para vender e escalar seu
            negócio digital.
          </p>

        </div>

        <div className="glass rounded-3xl overflow-hidden mt-16">

          <div className="grid grid-cols-3 border-b border-white/10">

            <div className="p-6 font-semibold">
              Recurso
            </div>

            <div className="p-6 bg-violet-600/10 font-bold text-violet-300 text-center">
              Uranova
            </div>

            <div className="p-6 text-center text-zinc-400">
              Outras Ferramentas
            </div>

          </div>

          {comparisons.map((item) => (
            <div
              key={item.feature}
              className="grid grid-cols-3 border-b border-white/5"
            >
              <div className="p-5">
                {item.feature}
              </div>

              <div className="p-5 flex justify-center">
                <Check
                  size={20}
                  className="text-green-400"
                />
              </div>

              <div className="p-5 flex justify-center">
                {item.outros ? (
                  <Check
                    size={20}
                    className="text-green-400"
                  />
                ) : (
                  <X
                    size={20}
                    className="text-red-400"
                  />
                )}
              </div>

            </div>
          ))}

        </div>

        <div className="mt-12 glass rounded-3xl p-8 text-center">

          <Layers
            size={42}
            className="mx-auto text-violet-400 mb-4"
          />

          <h3 className="text-3xl font-bold">
            Uma única plataforma.
          </h3>

          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
            Não combine Linktree, Hotmart, checkout,
            área de membros e analytics separados.
            Centralize tudo dentro da Uranova.
          </p>

        </div>

      </div>
    </section>
  );
}