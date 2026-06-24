"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      setEmail(session.user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setIsPro(data.is_pro);
      }
    }

    loadAccount();
  }, []);

  return (
    <div className="p-8 text-white space-y-6">

      <h1 className="text-3xl font-bold">
        Configurações da Conta
      </h1>

      <div className="bg-zinc-900 p-6 rounded-2xl">
        <p className="text-zinc-400 mb-2">
          Email
        </p>

        <div>{email}</div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl">
        <p className="text-zinc-400 mb-2">
          Plano Atual
        </p>

        <div className="font-bold text-green-400">
          {isPro ? "PRO" : "FREE"}
        </div>
      </div>

    </div>
  );
}