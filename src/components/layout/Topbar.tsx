"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  name: string | null;
  avatar_url: string | null;
  is_pro: boolean;
};

export default function Topbar() {

const [profile, setProfile] =
  useState<Profile | null>(null);

  const [openMenu, setOpenMenu] =
    useState(false);

useEffect(() => {
  async function fetchProfile() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
  .from("profiles")
  .select(`
    name,
    avatar_url,
    is_pro
  `)
  .eq("id", user.id)
  .single();

if (error) {
  console.error(error);
  return;
}

setProfile(data);
  }

  fetchProfile();

}, []);

  return (
    <header
      className="
        relative
        h-20
        border-b
        border-zinc-800
        bg-zinc-950/80
        backdrop-blur-xl
        px-8
        flex
        items-center
        justify-between
        z-50
      "
    >
      {/* Pesquisa */}
      <div className="flex-1 max-w-xl">

        <input
          placeholder="🔍 Pesquisar..."
          className="
            w-full
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-5
            py-3
            text-white
            outline-none
            transition
            focus:border-green-500
          "
        />

      </div>

      {/* Direita */}
      <div className="flex items-center gap-4">

        {/* Notificações */}
        <button
          className="
            w-12
            h-12
            rounded-2xl
            bg-zinc-900
            border
            border-zinc-800
            flex
            items-center
            justify-center
            hover:border-green-500
            transition
          "
        >
          🔔
        </button>

        <div
  className={`
    hidden
    md:flex
    px-5
    py-3
    rounded-2xl
    font-bold
    text-white
    ${
      profile?.is_pro
        ? "bg-gradient-to-r from-purple-600 to-pink-600"
        : "bg-zinc-800"
    }
  `}
>
  {profile?.is_pro ? "💎 PRO" : "FREE"}

</div>

<div className="relative">

<button
  onClick={() => setOpenMenu(!openMenu)}
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

  {/* Avatar */}
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
      {profile?.name?.charAt(0) || "U"}
    </div>

  )}

  <div className="hidden md:block text-left">

    <h2 className="font-bold text-white">
      {profile?.name || "Usuário"}
    </h2>

    <p className="text-zinc-500 text-sm">
      {profile?.is_pro ? "Plano PRO" : "Plano Free"}
    </p>

  </div>

</button>

{openMenu && (

<div
  className="
    fixed
    top-24
    right-8
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
    href="/dashboard/settings"
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

      </div>

    </header>
  );
}