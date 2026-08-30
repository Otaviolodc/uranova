"use client";

import SettingsPreview from "@/components/dashboard/settings/SettingsPreview";
import SettingsForm from "@/components/dashboard/settings/SettingsForm";
import SettingsBanner from "@/components/dashboard/settings/SettingsBanner";
import SettingsHeader from "@/components/dashboard/settings/SettingsHeader";
import { useProfile } from "@/hooks/useProfile";

import { supabase } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function SettingsPage() {
  
  const {
  profile,
  setProfile,
  updateField,
  loading,
  setLoading,
} = useProfile({
  id: "",
  name: null,
  username: null,
  avatar_url: null,
  bio: null,
  phone: null,
  city: null,
  state: null,
  address: null,
  instagram: null,
  telegram: null,
  whatsapp: null,
  featured_text: null,
  featured_url: null,
  product_text_color: "#ffffff",
  theme_color: "#00ff88",
  background_color: "#000000",
  button_style: "default",
  background_style: "default",
  card_style: "default",
  font_style: "default",
  template: "default",
  stripe_customer: null,
  subscription_status: null,
  subscription_plan: null,
  subscription_end: null,
  is_pro: false,
  role: "user",
  created_at: "",
  updated_at: "",
});

  // PERFIL
  
  // 🎨 CORES

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

      setProfile((prev) => ({
        ...prev,
        ...data,
      }));
      
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

updateField(
  "avatar_url",
  data.publicUrl
);

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
      username: profile.username,
      bio: profile.bio,
      template: profile.template,

      avatar_url: profile.avatar_url,

      instagram: profile.instagram,
      telegram: profile.telegram,
      whatsapp: profile.whatsapp,

      featured_text:
        profile.featured_text,

      featured_url:
        profile.featured_url,

      theme_color:
        profile.theme_color,

      product_text_color:
        profile.product_text_color,

      background_style:
        profile.background_style,

      card_style:
        profile.card_style,

      button_style:
        profile.button_style,
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

    <SettingsHeader
      title="Aparência"
      description="Personalize sua página pública e identidade visual."
    />

    <SettingsBanner
      profile={profile}
    />

        {/* GRID */}
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8 items-start">

      {/* COLUNA ESQUERDA */}
      <div>
        <SettingsForm
          profile={profile}
          updateField={updateField}
          handleUpload={handleUpload}
          handleSave={handleSave}
          loading={loading}
        />
      </div>

      <SettingsPreview
        profile={profile}
      />

    </div>

  </div>

</div>

</div>

);
}