import type { Profile } from "@/types/profile";

type Props = {
  profile: Profile;

  updateField: <K extends keyof Profile>(
    field: K,
    value: Profile[K]
  ) => void;

  handleUpload: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  handleSave: () => void;

  loading: boolean;
};

export default function SettingsForm({
  profile,
  updateField,
  handleUpload,
  handleSave,
  loading,
}: Props) {
  return (
    <div className="space-y-6">

      {/* PERFIL PÚBLICO */}
      <section
        className="
          bg-zinc-900/70
          border
          border-zinc-800
          rounded-[32px]
          p-6
          md:p-8
          shadow-2xl
        "
      >

        <div className="mb-7">

          <p className="text-xs font-bold uppercase tracking-wider text-green-400">
            Perfil público
          </p>

          <h2 className="text-2xl font-black text-white mt-1">
            Identidade da sua página
          </h2>

          <p className="text-zinc-500 text-sm mt-2">
            Configure como seus visitantes vão encontrar você.
          </p>

        </div>

        <div className="space-y-6">

          {/* USERNAME */}
          <div>

            <label className="text-sm font-semibold text-zinc-300 mb-2 block">
              Username
            </label>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                @
              </span>

              <input
                value={profile.username ?? ""}
                onChange={(e) =>
                  updateField(
                    "username",
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "_")
                  )
                }
                placeholder="seu_username"
                className="
                  w-full
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-2xl
                  pl-9
                  pr-4
                  py-4
                  text-white
                  outline-none
                  transition
                  focus:border-green-500
                  focus:ring-2
                  focus:ring-green-500/10
                "
              />

            </div>

            <p className="text-xs text-zinc-500 mt-2">
              Será usado no endereço da sua página pública.
            </p>

          </div>

          {/* FOTO */}
          <div>

            <label className="text-sm font-semibold text-zinc-300 mb-2 block">
              Foto de perfil
            </label>

            <label
              className="
                flex
                items-center
                gap-4
                w-full
                bg-zinc-800
                border
                border-dashed
                border-zinc-700
                hover:border-green-500/50
                rounded-2xl
                p-4
                cursor-pointer
                transition
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-zinc-700
                  flex
                  items-center
                  justify-center
                  text-xl
                  shrink-0
                "
              >
                📷
              </div>

              <div className="min-w-0">

                <p className="text-white font-semibold">
                  Escolher nova foto
                </p>

                <p className="text-zinc-500 text-xs mt-1">
                  JPG, PNG ou WEBP
                </p>

              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />

            </label>

          </div>

          {/* BIO */}
          <div>

            <label className="text-sm font-semibold text-zinc-300 mb-2 block">
              Bio
            </label>

            <textarea
              rows={5}
              value={profile.bio ?? ""}
              onChange={(e) =>
                updateField(
                  "bio",
                  e.target.value
                )
              }
              placeholder="Conte um pouco sobre você, sua marca ou o que você oferece..."
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-2xl
                p-4
                text-white
                placeholder:text-zinc-600
                outline-none
                resize-none
                transition
                focus:border-green-500
                focus:ring-2
                focus:ring-green-500/10
              "
            />

            <p className="text-xs text-zinc-500 mt-2">
              Uma boa bio ajuda seus visitantes a entenderem sua página.
            </p>

          </div>

        </div>

      </section>

      {/* REDES SOCIAIS */}
      <section
        className="
          bg-zinc-900/70
          border
          border-zinc-800
          rounded-[32px]
          p-6
          md:p-8
          shadow-2xl
        "
      >

        <div className="mb-7">

          <p className="text-xs font-bold uppercase tracking-wider text-green-400">
            Conexões
          </p>

          <h2 className="text-2xl font-black text-white mt-1">
            Redes sociais
          </h2>

          <p className="text-zinc-500 text-sm mt-2">
            Adicione seus canais para facilitar o contato com seus visitantes.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* INSTAGRAM */}
          <div>

            <label className="text-sm font-semibold text-zinc-300 mb-2 block">
              Instagram
            </label>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                📸
              </span>

              <input
                placeholder="@seuinstagram"
                value={profile.instagram ?? ""}
                onChange={(e) =>
                  updateField(
                    "instagram",
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-2xl
                  pl-11
                  pr-4
                  py-4
                  text-white
                  outline-none
                  focus:border-green-500
                "
              />

            </div>

          </div>

          {/* TELEGRAM */}
          <div>

            <label className="text-sm font-semibold text-zinc-300 mb-2 block">
              Telegram
            </label>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                ✈️
              </span>

              <input
                placeholder="@seutelegram"
                value={profile.telegram ?? ""}
                onChange={(e) =>
                  updateField(
                    "telegram",
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-2xl
                  pl-11
                  pr-4
                  py-4
                  text-white
                  outline-none
                  focus:border-green-500
                "
              />

            </div>

          </div>

          {/* WHATSAPP */}
          <div>

            <label className="text-sm font-semibold text-zinc-300 mb-2 block">
              WhatsApp
            </label>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                💬
              </span>

              <input
                placeholder="Seu WhatsApp"
                value={profile.whatsapp ?? ""}
                onChange={(e) =>
                  updateField(
                    "whatsapp",
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-2xl
                  pl-11
                  pr-4
                  py-4
                  text-white
                  outline-none
                  focus:border-green-500
                "
              />

            </div>

          </div>

        </div>

      </section>

      {/* DESTAQUE */}
      <section
        className="
          bg-zinc-900/70
          border
          border-zinc-800
          rounded-[32px]
          p-6
          md:p-8
          shadow-2xl
        "
      >

        <div className="mb-7">

          <p className="text-xs font-bold uppercase tracking-wider text-green-400">
            Destaque
          </p>

          <h2 className="text-2xl font-black text-white mt-1">
            Destaque da página
          </h2>

          <p className="text-zinc-500 text-sm mt-2">
            Crie uma chamada para direcionar seus visitantes para uma oferta,
            produto ou página importante.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* TEXTO */}
          <div>

            <label className="text-sm font-semibold text-zinc-300 mb-2 block">
              Texto do destaque
            </label>

            <input
              placeholder="Ex: Conheça meu novo produto"
              value={profile.featured_text ?? ""}
              onChange={(e) =>
                updateField(
                  "featured_text",
                  e.target.value
                )
              }
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-2xl
                p-4
                text-white
                placeholder:text-zinc-600
                outline-none
                focus:border-green-500
              "
            />

          </div>

          {/* URL */}
          <div>

            <label className="text-sm font-semibold text-zinc-300 mb-2 block">
              Link do destaque
            </label>

            <input
              placeholder="https://..."
              value={profile.featured_url ?? ""}
              onChange={(e) =>
                updateField(
                  "featured_url",
                  e.target.value
                )
              }
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-2xl
                p-4
                text-white
                placeholder:text-zinc-600
                outline-none
                focus:border-green-500
              "
            />

          </div>

        </div>

      </section>

      {/* SALVAR */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="
          w-full
          bg-gradient-to-r
          from-green-500
          to-emerald-400
          hover:from-green-400
          hover:to-emerald-300
          disabled:opacity-50
          disabled:cursor-not-allowed
          text-black
          font-black
          py-5
          rounded-2xl
          transition
          shadow-xl
          shadow-green-500/10
        "
      >
        {loading
          ? "Salvando alterações..."
          : "Salvar alterações"}
      </button>

    </div>
  );
}