import Link from "next/link";

import SectionCard from "@/components/dashboard/shared/SectionCard";

export default function AccountActions() {
  return (
    <SectionCard
      title="Ações"
      description="Gerencie sua conta e assinatura."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/pricing"
          className="
            rounded-2xl
            border
            border-green-500/30
            bg-zinc-950
            p-5
            transition
            hover:border-green-500
          "
        >
          <h3 className="font-bold text-white">
            🚀 Upgrade PRO
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            Desbloqueie todos os recursos da Uranova.
          </p>
        </Link>

        <button
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            p-5
            text-left
            transition
            hover:border-green-500
          "
        >
          <h3 className="font-bold text-white">
            🔐 Alterar Senha
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            Atualize sua senha com segurança.
          </p>
        </button>

        <button
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            p-5
            text-left
            transition
            hover:border-green-500
          "
        >
          <h3 className="font-bold text-white">
            📧 Alterar E-mail
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            Atualize o endereço de e-mail da sua conta.
          </p>
        </button>
      </div>
    </SectionCard>
  );
}