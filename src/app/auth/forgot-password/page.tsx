"use client";

import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import AuthLogo from "@/components/auth/AuthLogo";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthFooter from "@/components/auth/AuthFooter";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleForgotPassword(
  e: React.FormEvent
) {
  e.preventDefault();

  if (!email.trim()) {
    alert("Digite seu e-mail.");
    return;
  }

  setLoading(true);

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          `${window.location.origin}/auth/reset-password`,
      }
    );

  setLoading(false);

  if (error) {
    alert(error.message);
    return;
  }

  alert(
    "Enviamos um link de recuperação para o seu e-mail."
  );

  setEmail("");
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6">
      <AuthCard>

        <AuthLogo />

        <h1 className="mt-8 text-center text-3xl font-bold text-white">
          Recuperar senha
        </h1>

        <p className="mt-2 text-center text-sm text-zinc-400">
          Digite seu e-mail para receber um link de redefinição de senha.
        </p>

        <form
          onSubmit={handleForgotPassword}
          className="mt-8 space-y-5"
        >
          <AuthInput
            label="E-mail"
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={setEmail}
          />

          <AuthButton loading={loading}>
            Enviar link
          </AuthButton>
        </form>

        <div className="mt-6">
          <AuthFooter
            text="Lembrou sua senha?"
            linkText="Entrar"
            href="/auth/login"
          />
        </div>

      </AuthCard>
    </main>
  );
}