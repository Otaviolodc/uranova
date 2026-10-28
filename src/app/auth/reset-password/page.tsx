"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthCard from "@/components/auth/AuthCard";
import AuthLogo from "@/components/auth/AuthLogo";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthFooter from "@/components/auth/AuthFooter";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleReset(e: React.FormEvent) {
  e.preventDefault();

  if (password !== confirmPassword) {
    alert("As senhas não coincidem.");
    return;
  }

  if (password.length < 12 || password.length > 128) {
    alert("A senha deve possuir entre 12 e 128 caracteres.");
    return;
  }

  setLoading(true);

  const {data: {user}, error: sessionError} = await supabase.auth.getUser();
  if (sessionError || !user) {
    setLoading(false);
    alert("Abra um link de recuperação válido antes de redefinir a senha.");
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  setLoading(false);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Senha alterada com sucesso!");

  await supabase.auth.signOut({scope:"local"});

  router.push("/auth/login");
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6">
      <AuthCard>

        <AuthLogo />

        <h1 className="mt-8 text-center text-3xl font-bold text-white">
          Criar nova senha
        </h1>

        <p className="mt-2 text-center text-sm text-zinc-400">
          Digite sua nova senha para acessar novamente sua conta.
        </p>

        <form
          onSubmit={handleReset}
          className="mt-8 space-y-5"
        >

          <PasswordInput
            label="Nova senha"
            placeholder="Digite sua nova senha"
            value={password}
            onChange={setPassword}
          />

          <PasswordInput
            label="Confirmar senha"
            placeholder="Confirme sua nova senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <AuthButton loading={loading}>
            Salvar nova senha
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
