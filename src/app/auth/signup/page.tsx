"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";

import AuthCard from "@/components/auth/AuthCard";
import AuthLogo from "@/components/auth/AuthLogo";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthFooter from "@/components/auth/AuthFooter";

export default function SignupPage() {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
  e.preventDefault();

  if (!name.trim()) {
    alert("Digite seu nome.");
    return;
  }

  if (!email.trim()) {
    alert("Digite seu e-mail.");
    return;
  }

  if (password.length < 12 || password.length > 128) {
    alert("A senha deve possuir entre 12 e 128 caracteres.");
    return;
  }

  if (password !== confirmPassword) {
    alert("As senhas não coincidem.");
    return;
  }

  setLoading(true);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + "/auth/callback",
      data: {
        username: name,
      },
    },
  });

  if (error) {
    alert(error.message);
    setLoading(false);
    return;
  }

  if (!data.session) {
    alert("Confira seu e-mail para confirmar o cadastro antes de entrar.");
    setLoading(false);
    return;
  }

  setLoading(false);

  router.replace("/dashboard");
}

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#050505]
        px-6
      "
    >
      <AuthCard>
        <AuthLogo />

        <h1 className="mt-8 text-center text-3xl font-bold text-white">
          Criar sua conta
        </h1>

        <div className="mt-2">
          <AuthFooter
            text="Já possui uma conta?"
            linkText="Entrar"
            href="/auth/login"
          />
        </div>

        <form
          onSubmit={handleSignup}
          className="mt-8 space-y-5"
        >
          <AuthInput
            label="Nome"
            type="text"
            placeholder="Digite seu nome"
            value={name}
            onChange={setName}
          />

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

          <PasswordInput
            label="Confirmar senha"
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <AuthButton loading={loading}>
            Criar conta
          </AuthButton>
        </form>
      </AuthCard>
    </main>
  );
}
