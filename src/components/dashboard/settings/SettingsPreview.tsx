import dynamic from "next/dynamic";

import type { Profile } from "@/types/profile";

import ThemeCustomizer from "@/components/profile/ThemeCustomizer";

const ProfilePreview = dynamic(
  () => import("@/components/dashboard/ProfilePreview"),
  {
    ssr: false,
  }
);

type Props = {
  profile: Profile;
  reloadProfile: () => Promise<void>;
};

export default function SettingsPreview({
  profile,
  reloadProfile,
}: Props) {
  return (
    <div className="xl:sticky xl:top-8 self-start">

      <ProfilePreview
        username={profile.username ?? ""}
        bio={profile.bio ?? ""}
        avatarUrl={profile.avatar_url ?? ""}
        themeColor={profile.theme_color}
        productTextColor={
          profile.product_text_color
        }
      />

      <div
        className="
          mt-5
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-5
        "
      >
        <h3 className="text-white font-bold mb-2">
          👀 Prévia em tempo real
        </h3>

        <p className="text-zinc-400 text-sm">
          As alterações feitas aqui serão exibidas na sua página pública.
        </p>
      </div>

      <ThemeCustomizer
        profile={profile}
        reloadProfile={reloadProfile}
      />

    </div>
  );
}