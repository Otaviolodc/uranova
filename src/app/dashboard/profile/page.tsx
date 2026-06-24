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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log("USER:", user);
        console.log("USER ERROR:", userError);

        if (!user) {
          setLoading(false);
          return;
        }

        setEmail(user.email || "");

        const {
          data,
          error,
        } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        console.log("PROFILE DATA:", data);
        console.log("PROFILE ERROR:", error);

        if (error) {
          setLoading(false);
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error("PROFILE PAGE:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-zinc-400">
        Carregando perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-red-400">
        Perfil não encontrado
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
      <div>Telefone: {profile.phone || "-"}</div>
      <div>Cidade: {profile.city || "-"}</div>
      <div>Estado: {profile.state || "-"}</div>
      <div>Plano: {profile.is_pro ? "PRO" : "FREE"}</div>
    </div>
  );
}