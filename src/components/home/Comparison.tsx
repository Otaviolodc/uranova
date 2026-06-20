import {
  Check,
  X,
  Layers,
} from "lucide-react";

const comparisons = [
  {
    feature: "Página de Links",
    outros: true,
  },
  {
    feature: "Área de Membros",
    outros: false,
  },
  {
    feature: "Venda de Cursos",
    outros: false,
  },
  {
    feature: "Venda de E-books",
    outros: false,
  },
  {
    feature: "Mentorias",
    outros: false,
  },
  {
    feature: "Assinaturas Recorrentes",
    outros: false,
  },
  {
    feature: "Analytics Avançado",
    outros: false,
  },
  {
    feature: "Checkout Integrado",
    outros: false,
  },
  {
    feature: "Saques",
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

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Pare de pagar várias plataformas
          </h2>

          <p className="text-zinc-400 text-lg mt-6 leading-relaxed">
            Enquanto outras ferramentas resolvem apenas
            uma parte do problema, a Uranova reúne tudo
            que você precisa para vender e escalar seu
            negócio digital.
          </p>

        </div>

        {/* TABELA */}
        <div
          className="
            glass
            rounded-[32px]
            overflow-hidden
            mt-20
            border
            border-white/5
            shadow-lg
            shadow-black/20
          "
        >

          <div className="grid grid-cols-3 border-b border-white/10">

            <div className="p-6 font-semibold">
              Recurso
            </div>

            <div className="p-6 text-center bg-violet-600/10 text-violet-300 font-bold">
              Uranova
            </div>

            <div className="p-6 text-center text-zinc-400">
              Outras Ferramentas
            </div>

          </div>

          {comparisons.map((item) => (
            <div
              key={item.feature}
              className="
                grid
                grid-cols-3
                border-b
                border-white/5
              "
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

        {/* CARD FINAL */}
        <div
          className="
            glass
            rounded-[32px]
            border
            border-white/5
            shadow-lg
            shadow-black/20
            p-10
            mt-14
            text-center
          "
        >

          <Layers
            size={44}
            className="mx-auto text-violet-400 mb-5"
          />

          <h3 className="text-3xl font-bold">
            Uma única plataforma.
          </h3>

          <p className="text-zinc-400 mt-5 max-w-2xl mx-auto leading-relaxed">
            Não combine Linktree, Hotmart, checkout,
            área de membros e analytics separados.
            Centralize tudo dentro da Uranova e tenha
            uma operação mais simples e profissional.
          </p>

        </div>

      </div>
    </section>
  );
}
