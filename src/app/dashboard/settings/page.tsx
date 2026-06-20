"use client";

import { supabase }
from "@/lib/supabase/client";
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

  const [profile, setProfile] =
    useState<any>(null);

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

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {

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
        data.product_text_color ||
          "#ffffff"
      );
    }
  };

  useEffect(() => {
  fetchProfile();
}, []);

// 📸 upload imagem
const handleUpload = async (
  e: any
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

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
  console.log(error);

  alert(error.message);

  return;
}

const { data } = supabase.storage
  .from("avatars")
  .getPublicUrl(fileName);

setAvatarUrl(data.publicUrl);
};

  // 💾 salvar
  const handleSave = async () => {

  try {

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        "Usuário não encontrado"
     );
    }

    const { error } =
      await supabase
        .from("profiles")
        .update({

          username,
          bio,
          template,
          avatar_url: avatarUrl,
          instagram,
          telegram,
          whatsapp,
          featured_text:
            featuredText,
          featured_url:
            featuredUrl,
          theme_color:
            themeColor,
          product_text_color:
            productTextColor,

        })
        .eq("id", user.id);

    if (error) {

      console.log(error);

      alert(error.message);

      return;

    }

    alert(
      "Perfil atualizado 🚀"
    );

  } catch (error) {

    console.log(error);

    alert(
      "Erro ao salvar perfil"
    );

  } finally {

    // 🔥 ESSENCIAL
    setLoading(false);

  }

};

  return (

  <div className="flex bg-black text-white min-h-screen">

    <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8">

    {/* HEADER */}
    <div className="mb-10">

      <h1 className="text-3xl md:text-5xl font-bold">
        Editar Perfil
      </h1>

      <p className="text-gray-400 mt-2 text-lg">
        Personalize sua página pública
      </p>

    </div>

    {/* BANNER PREMIUM */}
    <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-[32px] p-5 md:p-12 mb-10 relative overflow-hidden">

      <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">

        <img
          src={
            avatarUrl ||
            "/placeholder.png"
          }
          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4"
          style={{
            borderColor: themeColor,
          }}
        />

        <div>

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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6 md:gap-10">

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
                setThemeColor(
                  e.target.value
                )
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
                setProductTextColor(
                  e.target.value
                )
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
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-8 bg-green-500 hover:bg-green-400 transition text-black font-bold py-4 rounded-2xl text-lg"
        >
          {loading
            ? "Salvando..."
            : "Salvar Perfil"}
        </button>

      </div>

      {/* PREVIEW */}
      <ProfilePreview
        username={username}
        bio={bio}
        avatarUrl={avatarUrl}
        themeColor={themeColor}
        productTextColor={
          productTextColor
        }
      />

      <ThemeCustomizer
  profile={profile}
  reloadProfile={fetchProfile}
/>
    </div>

  </div>

</div>
);

}