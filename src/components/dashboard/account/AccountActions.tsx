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
          href="/dashboard/account/upgrade"
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
            💎 Upgrade PRO
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            Desbloqueie todos os recursos da Uranova.
          </p>
        </Link>

        <Link
          href="/dashboard/account/password"
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            p-5
            transition
            hover:border-green-500
          "
        >
          <h3 className="font-bold text-white">
            🔒 Alterar Senha
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            Atualize sua senha com segurança.
          </p>
        </Link>

        <Link
          href="/dashboard/account/delete"
          className="
            rounded-2xl
            border
            border-red-500/30
            bg-zinc-950
            p-5
            transition
            hover:border-red-500
          "
        >
          <h3 className="font-bold text-red-400">
            🗑 Excluir Conta
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            Remova permanentemente sua conta.
          </p>
        </Link>

      </div>
    </SectionCard>
  );
}