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
  <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-[32px] p-6 md:p-8 shadow-2xl space-y-8">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">
          Username
        </label>

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
          className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">
          Upload da Foto
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">
          Cor do tema
        </label>

        <input
          type="color"
          value={profile.theme_color}
          onChange={(e) =>
            updateField(
              "theme_color",
              e.target.value
            )
          }
          className="w-full h-16 rounded-2xl"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-400 mb-2 block">
          Cor texto produto
        </label>

        <input
          type="color"
          value={profile.product_text_color}
          onChange={(e) =>
            updateField(
              "product_text_color",
              e.target.value
            )
          }
          className="w-full h-16 rounded-2xl"
        />
      </div>

    </div>

    <div>

      <label className="text-sm text-zinc-400 mb-2 block">
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
        className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
      />

    </div>

    <div className="grid md:grid-cols-3 gap-6">

      <input
        placeholder="Instagram"
        value={profile.instagram ?? ""}
        onChange={(e) =>
          updateField(
            "instagram",
            e.target.value
          )
        }
        className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
      />

      <input
        placeholder="Telegram"
        value={profile.telegram ?? ""}
        onChange={(e) =>
          updateField(
            "telegram",
            e.target.value
          )
        }
        className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
      />

      <input
        placeholder="WhatsApp"
        value={profile.whatsapp ?? ""}
        onChange={(e) =>
          updateField(
            "whatsapp",
            e.target.value
          )
        }
        className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
      />

    </div>

    <div className="grid md:grid-cols-2 gap-6">

      <input
        placeholder="Texto destaque"
        value={profile.featured_text ?? ""}
        onChange={(e) =>
          updateField(
            "featured_text",
            e.target.value
          )
        }
        className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
      />

      <input
        placeholder="URL destaque"
        value={profile.featured_url ?? ""}
        onChange={(e) =>
          updateField(
            "featured_url",
            e.target.value
          )
        }
        className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
      />

    </div>

    <div>

      <label className="text-sm text-zinc-400 mb-2 block">
        Template
      </label>

      <select
        value={profile.template}
        onChange={(e) =>
          updateField(
            "template",
            e.target.value
          )
        }
        className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
      >
        <option value="default">Default</option>
        <option value="glass">Glass</option>
        <option value="cyberpunk">Cyberpunk</option>
        <option value="minimal">Minimal</option>
        <option value="dark">Dark</option>
      </select>

    </div>

    <button
      onClick={handleSave}
      disabled={loading}
      className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-2xl transition"
    >
      {loading
        ? "Salvando..."
        : "💾 Salvar alterações"}
    </button>

  </div>
);
}
