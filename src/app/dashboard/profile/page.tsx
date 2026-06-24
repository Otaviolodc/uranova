"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  is_pro: boolean;
  created_at: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
  async function fetchProfile() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("SESSION:", session);

    if (!session?.user) return;

    setEmail(session.user.email || "");

    const response = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

     console.log("PROFILE RESPONSE:", response);
     console.log("PROFILE DATA:", response.data);
     console.log("PROFILE ERROR:", response.error);

    if (response.data) {
      setProfile(response.data);
    }
  }

  fetchProfile();
}, []);

  if (!profile) {
    return (
      <div className="p-8 text-zinc-400">
        Carregando perfil...
      </div>
    );
  }

  return (
    <div className="p-8 text-white space-y-4">
      <h1 className="text-3xl font-bold">
        Meu Perfil
      </h1>

      <div>Nome: {profile.name || "-"}</div>
      <div>Email: {email}</div>
      <div>Username: @{profile.username}</div>
      <div>Plano: {profile.is_pro ? "PRO" : "FREE"}</div>
    </div>
  );
}