"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Profile = {
  name: string | null;
  avatar_url: string | null;
  is_pro: boolean;
};

type Props = {
  profile: Profile | null;
};

export default function UserMenu({
  profile,
}: Props) {
  const [openMenu, setOpenMenu] =
    useState(false);

  return (
    <div className="relative">

      <button
        title="Menu do usuário"
        onClick={() =>
          setOpenMenu(!openMenu)
        }
        className="
          flex
          items-center
          gap-3
          bg-zinc-900
          border
          border-zinc-800
          rounded-2xl
          px-4
          py-2
          hover:border-green-500
          transition
        "
      >

        {profile?.avatar_url ? (

          <Image
            src={profile.avatar_url}
            alt={profile.name || "Avatar"}
            width={48}
            height={48}
            className="
              rounded-full
              object-cover
              border
              border-zinc-700
            "
          />

        ) : (

          <div
            className="
              w-12
              h-12
              rounded-full
              bg-gradient-to-r
              from-green-400
              to-emerald-600
              flex
              items-center
              justify-center
              text-black
              font-black
            "
          >
            {profile?.name?.[0]?.toUpperCase() || "..."}
          </div>

        )}

        <div className="hidden md:block text-left">

          <h2 className="font-bold text-white">
            {profile?.name ?? "Carregando..."}
          </h2>

          <p className="text-zinc-500 text-sm">
            {profile
             ? profile.is_pro
               ? "Plano PRO"
               : "Plano FREE"
             : "Carregando"}
          </p>

        </div>

      </button>

      {openMenu && (

        <div
          className="
            absolute
            top-20
            right-0
            w-64
            bg-zinc-950
            border
            border-zinc-800
            rounded-3xl
            shadow-2xl
            z-[99999]
          "
        >

          <Link
            href="/dashboard/profile"
            onClick={() =>
              setOpenMenu(false)
            }
            className="
              flex
              items-center
              px-5
              py-4
              hover:bg-zinc-900
              transition
            "
          >
            👤 Meu Perfil
          </Link>

          <Link
            href="/dashboard/account"
            onClick={() =>
              setOpenMenu(false)
            }
            className="
              flex
              items-center
              px-5
              py-4
              hover:bg-zinc-900
              transition
            "
          >
            ⚙️ Configurações
          </Link>

          <Link
            href="/auth/logout"
            onClick={() =>
              setOpenMenu(false)
            }
            className="
              flex
              items-center
              px-5
              py-4
              text-red-400
              hover:bg-zinc-900
            "
          >
            🚪 Sair da conta
          </Link>

        </div>

      )}

    </div>
  );
}