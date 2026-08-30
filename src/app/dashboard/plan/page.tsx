import Link from "next/link";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/services/profile.service";

const PRO_PRICE = "Em breve";

const freeFeatures = [
  "Página pública personalizada",
  "Até 3 links",
  "Produtos digitais",
  "Checkout Uranova",
  "Acompanhamento das vendas",
  "Área do cliente",
];

const proFeatures = [
  "Links ilimitados",
  "Produtos digitais",
  "Checkout Uranova",
  "Analytics avançado",
  "Personalização avançada",
  "Recursos exclusivos PRO",
  "Mais possibilidades para crescer",
];

export default async function PlanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getProfile(user.id);

  if (!profile) {
    throw new Error("Perfil não encontrado.");
  }

  const isPro = Boolean(profile.is_pro);

  return (
    <main className="w-full px-6 py-8 md:px-8 md:py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                border
                border-green-500/20
                bg-green-500/10
                text-xl
              "
            >
              💎
            </div>

            <span
              className="
                rounded-full
                border
                border-green-500/20
                bg-green-500/10
                px-4
                py-2
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-green-400
              "
            >
              Uranova
            </span>
          </div>

          <h1 className="text-3xl font-black md:text-5xl">
            Plano
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Escolha o plano ideal para o momento do seu negócio
            e tenha acesso aos recursos que a Uranova oferece.
          </p>
        </header>

        {/* ================================================== */}
        {/* PLANO ATUAL */}
        {/* ================================================== */}

        <section
          className="
            mb-8
            rounded-[28px]
            border
            border-zinc-800
            bg-zinc-900
            p-6
            md:p-8
          "
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Seu plano atual
              </p>

              <div className="mt-2 flex items-center gap-3">
                <h2 className="text-2xl font-black md:text-3xl">
                  {isPro ? "PRO" : "FREE"}
                </h2>

                <span
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-bold
                    ${
                      isPro
                        ? "bg-green-500/10 text-green-400"
                        : "bg-zinc-800 text-zinc-300"
                    }
                  `}
                >
                  Plano ativo
                </span>
              </div>

              <p className="mt-2 text-sm text-zinc-500">
                {isPro
                  ? "Você está utilizando o plano PRO da Uranova."
                  : "Você está utilizando o plano gratuito da Uranova."}
              </p>
            </div>

            {!isPro && (
              <Link
                href="#planos"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-500
                  px-6
                  py-3
                  text-sm
                  font-black
                  text-black
                  transition
                  hover:bg-green-400
                "
              >
                Conhecer o PRO
              </Link>
            )}

          </div>
        </section>

        {/* ================================================== */}
        {/* PLANOS */}
        {/* ================================================== */}

        <section id="planos" className="scroll-mt-8">

          <div className="mb-6">
            <h2 className="text-2xl font-black md:text-3xl">
              Escolha seu plano
            </h2>

            <p className="mt-2 text-zinc-500">
              Comece gratuitamente e evolua quando estiver
              pronto para crescer.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* ================================================== */}
            {/* FREE */}
            {/* ================================================== */}

            <article
              className="
                relative
                overflow-hidden
                rounded-[32px]
                border
                border-zinc-800
                bg-zinc-900
                p-7
                md:p-8
              "
            >

              <div className="mb-8">
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                      Para começar
                    </p>

                    <h3 className="mt-2 text-3xl font-black">
                      FREE
                    </h3>
                  </div>

                  {!isPro && (
                    <span
                      className="
                        rounded-full
                        bg-zinc-800
                        px-3
                        py-1
                        text-xs
                        font-bold
                        text-zinc-300
                      "
                    >
                      Atual
                    </span>
                  )}

                </div>

                <div className="mt-6">
                  <span className="text-4xl font-black">
                    R$ 0
                  </span>

                  <span className="ml-2 text-sm text-zinc-500">
                    / sempre
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                  Uma estrutura completa para começar a
                  vender e apresentar seus produtos na Uranova.
                </p>
              </div>

              <div className="h-px bg-zinc-800" />

              <div className="py-7">
                <p className="mb-4 text-sm font-bold text-zinc-300">
                  O que está incluído
                </p>

                <ul className="space-y-4">
                  {freeFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <span
                        className="
                          mt-0.5
                          flex
                          h-5
                          w-5
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-green-500/10
                          text-xs
                          font-black
                          text-green-400
                        "
                      >
                        ✓
                      </span>

                      <span className="text-sm text-zinc-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  p-4
                "
              >
                <p className="text-sm font-bold text-white">
                  Ideal para começar
                </p>

                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  Comece sem mensalidade e conheça a estrutura
                  da Uranova.
                </p>
              </div>

            </article>

            {/* ================================================== */}
            {/* PRO */}
            {/* ================================================== */}

            <article
              className="
                relative
                overflow-hidden
                rounded-[32px]
                border
                border-green-500/30
                bg-gradient-to-br
                from-green-500/10
                via-zinc-900
                to-zinc-900
                p-7
                shadow-[0_0_50px_rgba(34,197,94,0.06)]
                md:p-8
              "
            >

              <div
                className="
                  absolute
                  right-6
                  top-6
                  rounded-full
                  border
                  border-green-500/20
                  bg-green-500/10
                  px-3
                  py-1
                  text-xs
                  font-black
                  uppercase
                  tracking-wider
                  text-green-400
                "
              >
                Recomendado
              </div>

              <div className="mb-8 pr-24">
                <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                  Para crescer
                </p>

                <h3 className="mt-2 text-3xl font-black">
                  PRO
                </h3>

                <div className="mt-6">
                  {PRO_PRICE === "Em breve" ? (
                    <span className="text-3xl font-black text-green-400">
                      Em breve
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-green-400">
                        R$ {PRO_PRICE}
                      </span>

                      <span className="ml-2 text-sm text-zinc-500">
                        / mês
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Mais liberdade, recursos e possibilidades
                  para quem quer levar sua operação para o
                  próximo nível.
                </p>
              </div>

              <div className="h-px bg-green-500/20" />

              <div className="py-7">
                <p className="mb-4 text-sm font-bold text-white">
                  Tudo do FREE, mais
                </p>

                <ul className="space-y-4">
                  {proFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <span
                        className="
                          mt-0.5
                          flex
                          h-5
                          w-5
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-green-500
                          text-xs
                          font-black
                          text-black
                        "
                      >
                        ✓
                      </span>

                      <span className="text-sm text-zinc-200">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {isPro ? (
                <div
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-green-500/30
                    bg-green-500/10
                    px-6
                    py-4
                    text-sm
                    font-black
                    text-green-400
                  "
                >
                  ✓ Você já está no PRO
                </div>
              ) : (
                <Link
                  href="#planos"
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    rounded-2xl
                    bg-green-500
                    px-6
                    py-4
                    text-sm
                    font-black
                    text-black
                    transition
                    hover:-translate-y-0.5
                    hover:bg-green-400
                    hover:shadow-[0_10px_35px_rgba(34,197,94,0.20)]
                  "
                >
                  Conhecer o PRO
                </Link>
              )}

            </article>

          </div>
        </section>

        {/* ================================================== */}
        {/* COMPARAÇÃO */}
        {/* ================================================== */}

        <section className="mt-10">

          <div
            className="
              overflow-hidden
              rounded-[32px]
              border
              border-zinc-800
              bg-zinc-900
            "
          >

            <div className="border-b border-zinc-800 p-6 md:p-8">
              <h2 className="text-2xl font-black">
                Compare os planos
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Veja rapidamente a diferença entre FREE e PRO.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-zinc-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-zinc-400">
                      Recurso
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-bold text-zinc-400">
                      FREE
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-bold text-green-400">
                      PRO
                    </th>
                  </tr>
                </thead>

                <tbody>

                  <ComparisonRow
                    feature="Página pública"
                    free="✓"
                    pro="✓"
                  />

                  <ComparisonRow
                    feature="Links"
                    free="3"
                    pro="Ilimitados"
                  />

                  <ComparisonRow
                    feature="Produtos digitais"
                    free="✓"
                    pro="✓"
                  />

                  <ComparisonRow
                    feature="Checkout Uranova"
                    free="✓"
                    pro="✓"
                  />

                  <ComparisonRow
                    feature="Analytics"
                    free="Básico"
                    pro="Avançado"
                  />

                  <ComparisonRow
                    feature="Personalização"
                    free="Essencial"
                    pro="Avançada"
                  />

                  <ComparisonRow
                    feature="Recursos exclusivos"
                    free="—"
                    pro="✓"
                  />

                </tbody>
              </table>
            </div>

          </div>

        </section>

        {/* ================================================== */}
        {/* CTA */}
        {/* ================================================== */}

        {!isPro && (
          <section
            className="
              mt-10
              rounded-[32px]
              border
              border-green-500/20
              bg-green-500/5
              p-7
              md:p-10
            "
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                  Pronto para crescer?
                </p>

                <h2 className="mt-2 text-2xl font-black md:text-3xl">
                  Conheça o PRO da Uranova.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                  Tenha mais liberdade para criar, vender e
                  acompanhar sua operação.
                </p>
              </div>

              <Link
                href="#planos"
                className="
                  shrink-0
                  rounded-2xl
                  bg-green-500
                  px-7
                  py-4
                  text-center
                  text-sm
                  font-black
                  text-black
                  transition
                  hover:bg-green-400
                "
              >
                Ver detalhes do PRO
              </Link>

            </div>
          </section>
        )}

        {/* ================================================== */}
        {/* OBSERVAÇÃO */}
        {/* ================================================== */}

        <p className="mt-8 text-center text-xs leading-relaxed text-zinc-600">
          A disponibilidade de determinados recursos pode
          variar conforme a evolução dos planos da Uranova.
        </p>

      </div>
    </main>
  );
}

/* ========================================================== */
/* COMPARAÇÃO */
/* ========================================================== */

type ComparisonRowProps = {
  feature: string;
  free: string;
  pro: string;
};

function ComparisonRow({
  feature,
  free,
  pro,
}: ComparisonRowProps) {
  return (
    <tr className="border-t border-zinc-800">

      <td className="px-6 py-4 text-sm font-medium text-zinc-300">
        {feature}
      </td>

      <td className="px-6 py-4 text-center text-sm text-zinc-500">
        {free}
      </td>

      <td className="px-6 py-4 text-center text-sm font-semibold text-green-400">
        {pro}
      </td>

    </tr>
  );
}