"use client";
import { useEffect, useRef, useState } from "react";
import { uploadFile } from "@/lib/services/storage.service";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types/profile";
import SettingsPreview from "@/components/dashboard/settings/SettingsPreview";
import SettingsForm from "@/components/dashboard/settings/SettingsForm";
import SettingsBanner from "@/components/dashboard/settings/SettingsBanner";
import SettingsHeader from "@/components/dashboard/settings/SettingsHeader";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const busy = useRef(false);
  const uploadBusy = useRef(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error();
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (error || !data) throw new Error();
        if (active) { setProfile(data as Profile); setLoadError(false); }
      } catch { if (active) setLoadError(true); }
      finally { if (active) setFetching(false); }
    }
    void load();
    return () => { active = false; };
  }, [retry]);
  function updateField<K extends keyof Profile>(field: K, value: Profile[K]) {
    setProfile(previous => previous ? { ...previous, [field]: value } : previous);
  }
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || busy.current || uploadBusy.current || !profile) return;
    uploadBusy.current = true; setUploading(true); setFeedback("");
    try { updateField("avatar_url", await uploadFile("avatars", file)); }
    catch { setFeedback("Upload indisponível. Use PNG, JPEG ou WEBP até 4 MB."); }
    finally { uploadBusy.current = false; setUploading(false); e.target.value = ""; }
  }
  async function handleSave() {
    if (busy.current || uploadBusy.current || fetching || loadError || !profile?.id) return;
    busy.current = true; setSaving(true); setFeedback("");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user || user.id !== profile.id) throw new Error("SESSION_CHANGED");
      // Preserve the existing explicit editable-field allowlist. No role/plan/financial writes.
      const { data, error } = await supabase.from("profiles").update({
        username: profile.username, bio: profile.bio, template: profile.template,
        avatar_url: profile.avatar_url, instagram: profile.instagram, telegram: profile.telegram,
        whatsapp: profile.whatsapp, featured_text: profile.featured_text, featured_url: profile.featured_url,
        theme_color: profile.theme_color, product_text_color: profile.product_text_color,
        background_style: profile.background_style, card_style: profile.card_style, button_style: profile.button_style,
      }).eq("id", user.id).select("id").single();
      if (error || !data) throw new Error("SAVE_FAILED");
      setFeedback("Perfil atualizado.");
    } catch { setFeedback("Não foi possível confirmar o salvamento. Confira sua sessão e tente novamente."); }
    finally { busy.current = false; setSaving(false); }
  }
  if (fetching) return <p role="status" className="p-8">Carregando perfil...</p>;
  if (loadError || !profile) return <div role="alert" className="p-8">Não foi possível carregar seu perfil. <button onClick={() => { setFetching(true); setRetry(value => value + 1); }}>Tentar novamente</button></div>;
  return <div className="space-y-8"><div className="flex bg-black text-white min-h-screen"><div className="min-w-0 flex-1 p-4 md:p-8">
    <SettingsHeader title="Aparência" description="Personalize sua página pública e identidade visual." />
    {feedback && <p role="status" className="rounded-xl border border-zinc-700 p-4">{feedback}</p>}
    {uploading && <p role="status">Enviando imagem...</p>}
    <SettingsBanner profile={profile} />
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_350px] gap-8 items-start">
      <SettingsForm profile={profile} updateField={updateField} handleUpload={handleUpload} handleSave={handleSave} loading={saving || uploading} />
      <SettingsPreview profile={profile} />
    </div>
  </div></div></div>;
}
