"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();

      setIsPro(data?.is_pro || false);
    }

    loadUser();
  }, []);

  async function handleResetPassword() {
    if (!email) return;

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/auth/login`,
        }
      );

    if (error) {
      alert(error.message);
      return;
    }

    alert("Email enviado para redefinição da senha.");
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-white">
          ⚙ Configurações da Conta
        </h1>

        <p className="text-zinc-400 mt-2">
          Gerencie sua conta e preferências.
        </p>
      </div>

      {/* SEGURANÇA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-6">
          🔒 Segurança
        </h2>

        <div className="space-y-4">

          <div>
            <p className="text-zinc-400 text-sm">
              Email
            </p>

            <div className="mt-2 bg-black border border-zinc-800 rounded-2xl p-4 text-white">
              {email}
            </div>
          </div>

          <button
            onClick={handleResetPassword}
            className="
              px-6
              py-3
              rounded-2xl
              bg-green-600
              hover:bg-green-500
              transition
              text-white
              font-semibold
            "
          >
            Alterar Senha
          </button>

        </div>

      </div>

      {/* PLANO */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-6">
          ⭐ Plano
        </h2>

        <div className="flex items-center justify-between">

          <div>

            <p className="text-zinc-400">
              Plano atual
            </p>

            <h3 className="text-3xl font-black text-green-400 mt-2">
              {isPro ? "PRO" : "FREE"}
            </h3>

          </div>

          {!isPro && (
            <button
              className="
                px-6
                py-3
                rounded-2xl
                bg-green-600
                hover:bg-green-500
                text-white
                font-bold
                transition
              "
            >
              Upgrade para PRO
            </button>
          )}

        </div>

      </div>

      {/* PREFERÊNCIAS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-6">
          ⚙ Preferências
        </h2>

        <div className="space-y-4 text-zinc-300">

          <div className="flex justify-between">
            <span>Notificações por email</span>
            <span>Ativado</span>
          </div>

          <div className="flex justify-between">
            <span>Tema</span>
            <span>Dark</span>
          </div>

        </div>

      </div>

      {/* ZONA DE PERIGO */}
      <div className="bg-zinc-900 border border-red-900 rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-red-500 mb-6">
          🚨 Zona de Perigo
        </h2>

        <p className="text-zinc-400 mb-6">
          Esta ação é irreversível.
        </p>

        <button
          className="
            px-6
            py-3
            rounded-2xl
            bg-red-600
            hover:bg-red-500
            transition
            text-white
            font-bold
          "
        >
          Excluir Conta
        </button>

      </div>

    </div>
  );
}