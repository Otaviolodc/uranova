import Image from "next/image";
import type { Profile } from "@/types/profile";

type Props = {
  profile: Profile;
};

export default function SettingsBanner({
  profile,
}: Props) {

  // ==========================================================
  // PERSONALIZAÇÃO
  // FREE = verde padrão Uranova
  // PRO = utiliza a cor personalizada
  // ==========================================================

  const effectiveThemeColor =
    profile.is_pro
      ? profile.theme_color || "#00ff88"
      : "#00ff88";

  return (
    <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-[32px] p-5 md:p-12 mb-10 relative overflow-hidden">

      <div
        className="
          absolute
          top-0
          right-0
          w-72
          h-72
          blur-3xl
          rounded-full
          opacity-10
        "
        style={{
          background: effectiveThemeColor,
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">

        {/* AVATAR */}
        {profile.avatar_url ? (

          <Image
            src={profile.avatar_url}
            alt="Avatar"
            width={128}
            height={128}
            className="
              w-24
              h-24
              md:w-32
              md:h-32
              rounded-full
              object-cover
              border-4
            "
            style={{
              borderColor: effectiveThemeColor,
            }}
          />

        ) : (

          <div
            className="
              w-24
              h-24
              md:w-32
              md:h-32
              rounded-full
              border-4
              flex
              items-center
              justify-center
              text-4xl
              font-bold
              text-white
            "
            style={{
              borderColor: effectiveThemeColor,
              backgroundColor: effectiveThemeColor,
            }}
          >
            {profile.username?.[0]?.toUpperCase() || "U"}
          </div>

        )}

        {/* INFORMAÇÕES */}
        <div>

          <div className="flex items-center gap-3">

            <h2 className="text-2xl md:text-5xl font-extrabold break-all">
              @{profile.username || "usuario"}
            </h2>

            {profile.is_pro && (
              <div
                className="
                  bg-green-500
                  text-black
                  font-bold
                  px-4
                  py-1
                  rounded-full
                  text-sm
                "
              >
                PRO
              </div>
            )}

          </div>

          <p className="text-gray-300 mt-3 text-lg">
            {profile.bio || "Sua bio aparecerá aqui"}
          </p>

        </div>

      </div>

    </div>
  );
}