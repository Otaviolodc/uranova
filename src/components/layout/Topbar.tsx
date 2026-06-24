"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import UserMenu from "./UserMenu";

type Profile = {
  name: string | null;
  avatar_url: string | null;
  is_pro: boolean;
};

export default function Topbar() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        return;
      }

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

      setProfile(data as Profile);
    }

    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
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

      <div className="flex items-center gap-4">

        <button
          title="Notificações"
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

        <UserMenu profile={profile} />

      </div>
    </header>
  );
}