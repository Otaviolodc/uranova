"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type { Profile } from "@/types/profile";

type Props = {
  profile: Profile | null;
};

export default function UserMenu({ profile }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/dashboard/profile")}
      title="Meu Perfil"
      aria-label="Abrir meu perfil"
      className="
        flex
        items-center
        justify-center
        w-11
        h-11
        md:w-12
        md:h-12
        rounded-full
        bg-zinc-900
        border
        border-zinc-800
        overflow-hidden
        hover:border-green-500
        hover:ring-2
        hover:ring-green-500/20
        transition-all
        duration-200
        cursor-pointer
      "
    >
      {profile?.avatar_url ? (
        <Image
          src={profile.avatar_url}
          alt={profile.name || "Avatar"}
          width={48}
          height={48}
          className="
            w-full
            h-full
            object-cover
          "
        />
      ) : (
        <div
          className="
            w-full
            h-full
            flex
            items-center
            justify-center
            bg-gradient-to-r
            from-green-400
            to-emerald-600
            text-black
            font-black
            text-lg
          "
        >
          {profile?.name?.[0]?.toUpperCase() ??
            profile?.username?.[0]?.toUpperCase() ??
            "U"}
        </div>
      )}
    </button>
  );
}