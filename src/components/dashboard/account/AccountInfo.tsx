import Image from "next/image";

import SectionCard from "@/components/dashboard/shared/SectionCard";
import InfoItem from "@/components/dashboard/shared/InfoItem";

import type { Profile } from "@/types/profile";

type AccountInfoProps = {
  profile: Profile;
  email: string;
};

export default function AccountInfo({
  profile,
  email,
}: AccountInfoProps) {
  return (
    <SectionCard
      title="Informações da Conta"
      description="Seus dados cadastrais na plataforma Uranova."
    >
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.name ?? "Avatar"}
            width={120}
            height={120}
            className="rounded-full border border-zinc-700 object-cover"
          />
        ) : (
          <div
            className="
              w-[120px]
              h-[120px]
              rounded-full
              bg-gradient-to-r
              from-green-400
              to-emerald-600
              flex
              items-center
              justify-center
              text-5xl
              font-black
              text-black
            "
          >
            {profile.name?.[0]?.toUpperCase() ??
              profile.username?.[0]?.toUpperCase() ??
              "U"}
          </div>
        )}

        <div className="flex-1 w-full">
          <InfoItem
            label="Nome"
            value={profile.name ?? "-"}
          />

          <InfoItem
            label="Usuário"
            value={profile.username ?? "-"}
          />

          <InfoItem
            label="Email"
            value={email}
          />

          <InfoItem
            label="Plano"
            value={profile.is_pro ? "PRO" : "FREE"}
          />

          <InfoItem
            label="Criado em"
            value={new Date(profile.created_at).toLocaleDateString(
              "pt-BR"
            )}
          />
        </div>
      </div>
    </SectionCard>
  );
}