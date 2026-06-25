"use client";

import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import ThemeCustomizer from "@/components/profile/ThemeCustomizer";
import dynamic from "next/dynamic";

const ProfilePreview = dynamic(
  () => import("@/components/dashboard/ProfilePreview"),
  {
    ssr: false,
  }
);

export default function SettingsPage() {
  const [loading, setLoading] =
    useState(false);

  const [template, setTemplate] =
  useState("default");

  type Profile = {
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  instagram: string | null;
  telegram: string | null;
  whatsapp: string | null;
  featured_text: string | null;
  featured_url: string | null;
  theme_color: string | null;
  product_text_color: string | null;
  template: string | null;

  background_style: string | null;
  card_style: string | null;
  button_style: string | null;
};

  const [profile, setProfile] =
    useState<Profile | null>(null);

  // PERFIL
  const [username, setUsername] =
    useState("");

  const [bio, setBio] = useState("");

  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [instagram, setInstagram] =
    useState("");

  const [telegram, setTelegram] =
    useState("");

  const [whatsapp, setWhatsapp] =
    useState("");

  const [featuredText, setFeaturedText] =
    useState("");

  const [featuredUrl, setFeaturedUrl] =
    useState("");

  const [backgroundStyle, setBackgroundStyle] =
    useState("");

  const [cardStyle, setCardStyle] =
    useState("");

  const [buttonStyle, setButtonStyle] =
    useState("");

  // 🎨 CORES
  const [themeColor, setThemeColor] =
    useState("#00ff88");

  const [
    productTextColor,
    setProductTextColor,
  ] = useState("#ffffff");

  // 🚀 carregar perfil
  const fetchProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Usuário não encontrado");
    return;
  }

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(`
      username,
      bio,
      avatar_url,
      instagram,
      telegram,
      whatsapp,
      featured_text,
      featured_url,
      theme_color,
      product_text_color,
      template,
      background_style,
      card_style,
      button_style
    `)
    .eq("id", user.id)
    .single();

if (error) {
  console.error(
    "Settings fetchProfile:",
    error
  );
  return;
}

if (!data) {
  console.error(
    "Perfil não encontrado"
  );
  return;
}

      setProfile(data);
      
      setTemplate(
        data.template || "default"
      );
      setUsername(data.username || "");

      setBio(data.bio || "");

      setAvatarUrl(
        data.avatar_url || ""
      );

      setInstagram(
        data.instagram || ""
      );

      setTelegram(
        data.telegram || ""
      );

      setWhatsapp(
        data.whatsapp || ""
      );

      setFeaturedText(
        data.featured_text || ""
      );

      setFeaturedUrl(
        data.featured_url || ""
      );

      setThemeColor(
        data.theme_color ||
          "#00ff88"
      );

      setProductTextColor(
        data.product_text_color || "#ffffff"
      );
      
      setBackgroundStyle(
        data.background_style || ""
      );

      setCardStyle(
        data.card_style || ""
      );

      setButtonStyle(
        data.button_style || ""
      );
    
  };

  useEffect(() => {

  fetchProfile();

}, []);

// 📸 upload imagem
const handleUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const {
  data: { user },
} = await supabase.auth.getUser();

  const fileExt =
    file.name.split(".").pop();

  const fileName = `${user.id}-${Date.now()}.${fileExt}`;

  const { error } =
  await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      upsert: true,
    });

if (error) {

  console.error(error);

  alert(error.message);

  return;

}

const { data } = supabase.storage
  .from("avatars")
  .getPublicUrl(fileName);

setAvatarUrl(data.publicUrl);

};

  // 💾 Salvar
  const handleSave = async () => {

  try {

    setLoading(true);

    const {
  data: { user },
} = await supabase.auth.getUser();

const { error } =
  await supabase
    .from("profiles")
    .update({
      username: username || null,
      bio: bio || null,
      template: template || null,

      avatar_url: avatarUrl || null,

      instagram: instagram || null,
      telegram: telegram || null,
      whatsapp: whatsapp || null,

      featured_text: featuredText || null,
      featured_url: featuredUrl || null,

      theme_color: themeColor || "#00ff88",
      product_text_color:
        productTextColor || "#ffffff",

      background_style:
        backgroundStyle || null,

      card_style:
        cardStyle || null,

      button_style:
        buttonStyle || null,
    })
    .eq("id", user.id);

if (error) {

  console.error("UPDATE ERROR:", error);

  alert(`
  Mensagem: ${error.message}

  Código: ${error.code}

  Detalhes: ${error.details}

  Hint: ${error.hint}
  `);

  return;

}

    alert(
      "Perfil atualizado 🚀"
    );

  } catch (error: any) {

  console.error(error);

  alert(
    error?.message || JSON.stringify(error)
  );

} finally {

  setLoading(false);

}

};

  return (

  <div className="space-y-8">

  <div className="flex bg-black text-white min-h-screen">

    <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8">

    {/* HEADER */}
    <div className="mb-10">

      <h1 className="text-5xl font-black">
        🎨 Aparência
      </h1>

      <p className="text-zinc-400 mt-3">
        Personalize sua página pública e identidade visual.
      </p>

      <p className="text-gray-400 mt-2 text-lg">
        Personalize sua página pública
      </p>

    </div>

    {/* BANNER PREMIUM */}
    <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-[32px] p-5 md:p-12 mb-10 relative overflow-hidden">

      <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">

        {
          avatarUrl ? (

            <Image
              src={avatarUrl}
              alt="Avatar"
              width={128}
              height={128}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4"
              style={{
                borderColor: themeColor,
              }}
            />

        ) : (

            <div
              className="
                w-24 h-24 md:w-32 md:h-32
                rounded-full
                border-4
                flex items-center justify-center
                text-4xl font-bold
                text-white
              "
              style={{
                borderColor: themeColor,
                backgroundColor: themeColor,
              }}
            >
              {username?.[0]?.toUpperCase() || "U"}
            </div>

         )
       }

        <div>

          <div
            className="
              bg-green-500/20
              text-green-400
              px-4
              py-1
              rounded-full
              w-fit
              font-semibold
              mb-4
            "
          >
            🎨 Aparência da Página
          </div>

          <div className="flex items-center gap-3">

            <h2 className="text-2xl md:text-5xl font-extrabold break-all">
              @{username || "usuario"}
            </h2>

            <div className="bg-green-500 text-black font-bold px-4 py-1 rounded-full text-sm">
              PRO
            </div>

          </div>

          <p className="text-gray-300 mt-3 text-lg">
            {bio ||
              "Sua bio aparecerá aqui"}
          </p>

        </div>

      </div>

    </div>

        {/* GRID */}
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8 items-start">

      {/* COLUNA ESQUERDA */}
      <div>

        {/* FORM */}
        <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 rounded-[32px] p-4 md:p-8 shadow-2xl">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* USERNAME */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Username
              </label>

              <input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "_")
                  )
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
              />
            </div>

            {/* COR */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Cor do tema
              </label>

              <input
                type="color"
                value={themeColor}
                onChange={(e) =>
                  setThemeColor(e.target.value)
                }
                className="w-full h-16 rounded-2xl bg-zinc-800 border border-zinc-700"
              />
            </div>

            {/* TEXTO PRODUTO */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Cor texto produto
              </label>

              <input
                type="color"
                value={productTextColor}
                onChange={(e) =>
                  setProductTextColor(e.target.value)
                }
                className="w-full h-16 rounded-2xl bg-zinc-800 border border-zinc-700"
              />
            </div>

            {/* FOTO */}
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

          </div>

        {/* BIO */}
        <div className="mt-6">

          <label className="text-sm text-zinc-400 mb-2 block">
            Bio
          </label>

          <textarea
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            rows={5}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
          />

        </div>

        {/* REDES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

          <input
            placeholder="Instagram"
            value={instagram}
            onChange={(e) =>
              setInstagram(
                e.target.value
              )
            }
            className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
          />

          <input
            placeholder="Telegram"
            value={telegram}
            onChange={(e) =>
              setTelegram(
                e.target.value
              )
            }
            className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
          />

          <input
            placeholder="WhatsApp"
            value={whatsapp}
            onChange={(e) =>
              setWhatsapp(
                e.target.value
              )
            }
            className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
          />

        </div>

        {/* DESTAQUE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

          <input
            placeholder="Texto destaque"
            value={featuredText}
            onChange={(e) =>
              setFeaturedText(
                e.target.value
              )
            }
            className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
          />

          <input
            placeholder="URL destaque"
            value={featuredUrl}
            onChange={(e) =>
              setFeaturedUrl(
                e.target.value
              )
            }
            className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
          />

        </div>

        {/* TEMPLATE */}
<div className="mt-6">

  <label className="text-sm text-zinc-400 mb-2 block">
    Template Premium
  </label>

  <select
    value={template}
    onChange={(e) =>
      setTemplate(e.target.value)
    }
    className="
      w-full
      bg-zinc-900
      border
      border-zinc-800
      rounded-2xl
      px-4
      py-4
      text-white
    "
  >

    <option value="default">
      Default
    </option>

    <option value="glass">
      Glass Premium
    </option>

    <option value="cyberpunk">
      Cyberpunk
    </option>

    <option value="minimal">
      Minimal
    </option>

    <option value="dark">
      Dark Luxury
    </option>

    <option value="mercadolivre">
      Mercado Livre Style
    </option>

  </select>

</div>

{/* BOTÃO */}
<div className="mt-8">
  <button
    onClick={handleSave}
    disabled={loading}
    className="
      w-full
      bg-green-500
      hover:bg-green-400
      transition
      text-black
      font-bold
      py-4
      rounded-2xl
      text-lg
    "
  >
    {loading ? "Salvando..." : "💾 Salvar Alterações"}
  </button>
</div>

</div> 

</div> 

      {/* COLUNA DIREITA */}
      <div className="xl:sticky xl:top-8 self-start">

        <ProfilePreview
          username={username}
          bio={bio}
          avatarUrl={avatarUrl}
          themeColor={themeColor}
          productTextColor={productTextColor}
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
          reloadProfile={fetchProfile}
        />

      </div>

    </div>

  </div>

</div>

</div> 

);
}