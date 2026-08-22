import dynamic from "next/dynamic";

import type { Profile } from "@/types/profile";

const ProfilePreview = dynamic(
  () => import("@/components/dashboard/ProfilePreview"),
  {
    ssr: false,
  }
);

type Props = {
  profile: Profile;
};

export default function SettingsPreview({
  profile,
}: Props) {
  return (
    <div className="xl:sticky xl:top-8 self-start">

      {/* PREVIEW */}
      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-[32px]
          p-5
          shadow-2xl
        "
      >

        {/* CABEÇALHO */}
        <div className="mb-5">

          <p className="text-xs font-bold uppercase tracking-wider text-green-400">
            Página pública
          </p>

          <h3 className="text-xl font-black text-white mt-1 whitespace-nowrap">
            Prévia em tempo real
          </h3>

        </div>

        {/* CELULAR */}
        <div
          className="
            rounded-3xl
            overflow-hidden
            bg-black
          "
        >

          <ProfilePreview
            username={profile.username ?? ""}
            bio={profile.bio ?? ""}
            avatarUrl={profile.avatar_url ?? ""}
            themeColor={profile.theme_color}
            productTextColor={profile.product_text_color}
          />

        </div>

        {/* INFORMAÇÃO */}
        <div className="mt-5">

          <p className="text-zinc-500 text-sm leading-relaxed">
            As alterações feitas no seu perfil serão refletidas
            automaticamente na prévia.
          </p>

        </div>

      </div>

      {/* PLANO PRO */}
      <div
        className="
          mt-5
          rounded-[28px]
          border
          border-green-500/20
          bg-gradient-to-br
          from-green-500/10
          via-zinc-900
          to-zinc-900
          p-5
        "
      >

        <div className="flex items-start gap-4">

          <div
            className="
              w-11
              h-11
              rounded-2xl
              bg-green-500
              flex
              items-center
              justify-center
              text-black
              font-black
              text-lg
              shrink-0
            "
          >
            ✨
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h3 className="text-white font-black">
                Personalização avançada
              </h3>

              <span
                className="
                  bg-green-500
                  text-black
                  px-2
                  py-0.5
                  rounded-full
                  text-[10px]
                  font-black
                "
              >
                PRO
              </span>

            </div>

            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Em breve você poderá personalizar ainda mais sua
              página pública com temas, cores, estilos e layouts exclusivos.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}