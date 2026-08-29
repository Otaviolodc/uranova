import Link from "next/link";

import SectionCard from "@/components/dashboard/shared/SectionCard";

export default function AccountActions() {
  return (
    <div className="space-y-6">
      {/* ==================================================
          SEGURANÇA
      ================================================== */}

      <SectionCard
        title="Segurança"
        description="Proteja o acesso à sua conta."
      >
        <div className="flex flex-col gap-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold text-white">
              Alterar senha
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              Atualize sua senha para manter sua conta segura.
            </p>
          </div>

          <Link
            href="/dashboard/account/password"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-zinc-700
              bg-zinc-900
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:border-green-500
              hover:text-green-400
              md:w-auto
            "
          >
            Alterar senha
          </Link>
        </div>
      </SectionCard>

      {/* ==================================================
          ZONA DE PERIGO
      ================================================== */}

      <SectionCard
        title="Zona de perigo"
        description="Ações que podem afetar permanentemente sua conta."
      >
        <div className="flex flex-col gap-5 rounded-2xl border border-red-500/20 bg-zinc-950 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold text-white">
              Excluir conta
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              A exclusão da conta é permanente e não pode ser desfeita.
            </p>
          </div>

          <Link
            href="/dashboard/account/delete"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-red-500/40
              bg-red-500/10
              px-6
              py-3
              text-sm
              font-semibold
              text-red-400
              transition
              hover:border-red-500
              hover:bg-red-500/15
              hover:text-red-300
              md:w-auto
            "
          >
            Excluir minha conta
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}