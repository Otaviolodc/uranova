type Props = {
  username: string;
  bio: string;
  avatarUrl: string;
  themeColor: string;
  productTextColor: string;
};

export default function ProfilePreview({
  username,
  bio,
  avatarUrl,
  themeColor,
  productTextColor,
}: Props) {
  return (
    <div className="sticky top-10">

      {/* CELULAR */}
      <div
        className="
          w-[320px]
          h-[650px]
          bg-black
          border-[10px]
          border-zinc-900
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
          "
        />

        {/* Conteúdo */}
        <div
          className="h-full overflow-y-auto px-5 py-10 text-white"
          style={{
            background: `linear-gradient(to bottom, ${themeColor}, #000)`,
          }}
        >

          {/* Perfil */}
          <div className="flex flex-col items-center mt-10">

            <img
              src={avatarUrl || "/logo.png"}
              alt="Avatar do perfil"
              className="
                w-28
                h-28
                rounded-full
                object-cover
                border-4
                border-white
                shadow-2xl
              "
            />

            <h1 className="text-3xl font-bold mt-5">
              @{username || "usuario"}
            </h1>

            <p className="text-center text-white/80 mt-2 text-sm">
              {bio || "Sua bio aparecerá aqui"}
            </p>

          </div>

          {/* Produtos simulados */}
          <div className="mt-8 space-y-4">

            {[1, 2, 3].map((item) => (

              <div
                key={item}
                className="
                  bg-black/40
                  backdrop-blur-lg
                  border
                  border-white/10
                  rounded-2xl
                  p-4
                  flex
                  items-center
                  gap-4
                "
              >

                <img
                  src="/logo.png"
                  alt="Produto"
                  className="
                    w-16
                    h-16
                    rounded-xl
                    object-cover
                    border
                    border-zinc-700
                  "
                />

                <div>

                  <h3
                    className="font-bold"
                    style={{
                      color: productTextColor || "#ffffff",
                    }}
                  >
                    Produto Digital
                  </h3>

                  <p className="text-xs text-white/60">
                    Link afiliado
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}