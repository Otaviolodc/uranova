"use client";

import { useState } from "react";
import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import AuthLogo from "@/components/auth/AuthLogo";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthFooter from "@/components/auth/AuthFooter";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();

  setLoading(true);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    setLoading(false);
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Usuário não encontrado.");
    setLoading(false);
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  setLoading(false);

  if (profile?.role === "admin") {
    router.replace("/admin");
  } else {
    router.replace("/dashboard");
  }

}

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6">
      <AuthCard>

        <AuthLogo />

        <h1 className="mt-2 text-center text-3xl font-bold text-white">
          Entrar na sua conta
        </h1>

        <div className="mt-2">
          <AuthFooter
            text="Ainda não possui uma conta?"
            linkText="Criar gratuitamente"
            href="/auth/signup"
          />
        </div>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >
          <AuthInput
            label="E-mail"
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={setEmail}
          />

          <PasswordInput
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChange={setPassword}
          />

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-zinc-400 hover:text-green-500 transition"
            >
              Esqueci minha senha
            </Link>
          </div>

          <AuthButton loading={loading}>
            Entrar
          </AuthButton>

        </form>

      </AuthCard>
    </main>
  );
}