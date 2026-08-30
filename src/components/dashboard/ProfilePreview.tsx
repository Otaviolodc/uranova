type Props = {
  username: string;
  bio: string;
  avatarUrl: string;
  themeColor: string;
  backgroundStyle: string;
  cardStyle: string;
  buttonStyle: string;
  productTextColor: string;
  isPro: boolean;
};

export default function ProfilePreview({
  username,
  bio,
  avatarUrl,
  themeColor,
  backgroundStyle,
  cardStyle,
  buttonStyle,
  productTextColor,
  isPro,
}: Props) {
  // ==========================================================
  // PERSONALIZAÇÃO
  // FREE = padrão Uranova
  // PRO = personalização liberada
  // ==========================================================

  const effectiveThemeColor = isPro
    ? themeColor || "#00ff88"
    : "#00ff88";

  const effectiveBackgroundStyle = isPro
    ? backgroundStyle
    : "default";

  // ==========================================================
  // BACKGROUND
  // ==========================================================

  const backgroundClass =
    effectiveBackgroundStyle === "gradient"
      ? "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"
      : effectiveBackgroundStyle === "neon"
      ? "bg-gradient-to-br from-green-400 via-cyan-500 to-blue-600"
      : "bg-black";

  // ==========================================================
  // CARD STYLE
  // ==========================================================

  const cardClass =
    isPro && cardStyle === "glass"
      ? `
        bg-white/10
        backdrop-blur-2xl
        border
        border-white/10
      `
      : `
        bg-zinc-900
        border
        border-zinc-800
      `;

  // ==========================================================
  // BUTTON STYLE
  // ==========================================================

  const buttonRadius =
    isPro && buttonStyle === "square"
      ? "rounded-md"
      : "rounded-2xl";

  return (
    <div className="sticky top-10">

      {/* CELULAR */}
      <div
        className="
          w-[320px]
          h-[650px]
          bg-black
          rounded-[50px]
          overflow-hidden
          shadow-2xl
          relative
        "
      >

        {/* Dynamic Island */}
        <div
          className="
            absolute
            top-3
            left-1/2
            -translate-x-1/2
            w-28
            h-2
            bg-zinc-700
            rounded-full
            z-20
          "
        />

        {/* CONTEÚDO */}
        <div
          className={`
            h-full
            overflow-y-auto
            px-5
            py-10
            text-white
            ${backgroundClass}
          `}
        >

          {/* PERFIL */}
          <div className="flex flex-col items-center mt-10">

            {/* AVATAR */}
            <div
              className="
                rounded-full
                p-[3px]
                shadow-2xl
              "
              style={{
                background: effectiveThemeColor,
              }}
            >

              <img
                src={avatarUrl || "/logo.png"}
                alt="Avatar do perfil"
                className="
                  w-28
                  h-28
                  rounded-full
                  object-cover
                  border-4
                  border-black
                "
              />

            </div>

            {/* USERNAME */}
            <h1 className="text-3xl font-bold mt-5 text-center">
              @{username || "usuario"}
            </h1>

            {/* BIO */}
            <p className="text-center text-white/80 mt-2 text-sm">
              {bio || "Sua bio aparecerá aqui"}
            </p>

          </div>

          {/* PRODUTOS SIMULADOS */}
          <div className="mt-8 space-y-4">

            {[1, 2, 3].map((item) => (

              <div
                key={item}
                className={`
                  ${cardClass}
                  ${buttonRadius}
                  px-6
                  py-5
                  flex
                  justify-center
                  items-center
                  shadow-lg
                  transition
                `}
              >

                <h3
                  className="text-lg font-semibold text-center"
                  style={{
                    color: productTextColor || "#ffffff",
                  }}
                >
                  Produto Digital
                </h3>

              </div>

            ))}

          </div>

          {/* BOTÃO SIMULADO */}
          <div
            className={`
              mt-6
              w-full
              py-4
              text-center
              font-bold
              transition
              ${buttonRadius}
            `}
            style={{
              background: effectiveThemeColor,
              color: "#fff",
            }}
          >
            Saiba Mais →
          </div>

        </div>

      </div>

    </div>
  );
}