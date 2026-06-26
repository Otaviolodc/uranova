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
          className="rounded-full object-cover border border-zinc-700"
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
          {
            profile?.name?.[0]?.toUpperCase() ??
            profile?.username?.[0]?.toUpperCase() ??
            "U"
          }
        </div>
      )}

      <div className="hidden md:block text-left">
        <h2 className="font-bold text-white">
          {profile?.name || profile?.username || "Usuário"}
        </h2>

        <p className="text-zinc-500 text-sm">
          {profile?.is_pro ? "Plano PRO" : "Plano FREE"}
        </p>
      </div>
    </button>
  );
}