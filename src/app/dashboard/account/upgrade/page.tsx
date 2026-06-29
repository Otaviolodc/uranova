import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  Sparkles,
} from "lucide-react";

export default function UpgradePage() {
  const benefits = [
    "Produtos ilimitados",
    "Área de membros completa",
    "Checkouts ilimitados",
    "Analytics avançado",
    "Marketplace Uranova",
    "Sem marca d'água",
    "Suporte prioritário",
    "Novos recursos antecipados",
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">

      {/* Cabeçalho */}
      <div>
        <Link
          href="/dashboard/account"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar para Conta
        </Link>

        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-600/20 p-3">
              <Crown className="text-violet-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                Upgrade PRO
              </h1>

              <p className="mt-1 text-zinc-400">
                Desbloqueie todos os recursos da Uranova e aumente suas vendas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Plano Atual */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

          <span className="text-sm text-zinc-400">
            Seu Plano
          </span>

          <h2 className="mt-3 text-2xl font-bold text-white">
            FREE
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Você está utilizando os recursos gratuitos da plataforma.
          </p>

        </div>

        {/* Benefícios */}
        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-zinc-900 p-6 lg:col-span-2">

          <div className="flex items-center gap-2">
            <Sparkles className="text-violet-400" />

            <h2 className="text-xl font-semibold text-white">
              Benefícios do Uranova PRO
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            {benefits.map((benefit) => (

              <div
                key={benefit}
                className="flex items-center gap-3"
              >
                <CheckCircle2
                  size={18}
                  className="text-green-500"
                />

                <span className="text-zinc-200">
                  {benefit}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Plano PRO */}
      <div className="rounded-2xl border border-violet-500 bg-gradient-to-br from-violet-700/20 to-zinc-900 p-8">

        <div className="flex flex-col items-center text-center">

          <span className="rounded-full bg-violet-600 px-4 py-1 text-sm font-medium text-white">
            Plano PRO
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            R$ XX,90
            <span className="text-xl text-zinc-400">
              /mês
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-zinc-400">
            Assine o plano PRO para desbloquear todas as funcionalidades
            da Uranova e impulsionar o crescimento do seu negócio digital.
          </p>

          <button
            disabled
            className="mt-8 rounded-xl bg-violet-600 px-8 py-4 font-semibold text-white opacity-70"
          >
            Assinar PRO
          </button>

          <p className="mt-4 text-sm text-zinc-500">
            Integração com Asaas será ativada na próxima etapa.
          </p>

        </div>

      </div>

    </div>
  );
}