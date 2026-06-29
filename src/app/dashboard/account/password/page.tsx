"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase/client";

import {
  ArrowLeft,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

export default function PasswordPage() {

  // Campos do formulário
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

// Mostrar senha
const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);

// Estados da interface
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (
    !currentPassword.trim() ||
    !newPassword.trim() ||
    !confirmPassword.trim()
  ) {
    setError("Preencha todos os campos.");
    return;
  }

  if (newPassword.length < 8) {
    setError("A nova senha deve possuir pelo menos 8 caracteres.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setError("As senhas não coincidem.");
    return;
  }

  setLoading(true);

  try {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }

  setSuccess("Senha alterada com sucesso.");

  setCurrentPassword("");
  setNewPassword("");
  setConfirmPassword("");

} catch (err) {
  if (err instanceof Error) {
  if (err.message.toLowerCase().includes("password")) {
    setError("Não foi possível alterar a senha.");
  } else {
    setError(err.message);
  }
} else {
  setError("Ocorreu um erro inesperado.");
}

} finally {
  setLoading(false);
}
};

  return (
    <div className="mx-auto max-w-4xl space-y-8">

      {/* Cabeçalho */}
      <div>
        <Link
          href="/dashboard/account"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar para Conta
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-600/20 p-3">
            <LockKeyhole className="text-violet-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              Alterar Senha
            </h1>

            <p className="mt-1 text-zinc-400">
              Atualize sua senha para manter sua conta protegida.
            </p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

        <div className="mb-8 flex items-center gap-3">
          <ShieldCheck className="text-violet-400" />

          <div>
            <h2 className="text-xl font-semibold text-white">
              Segurança da Conta
            </h2>

            <p className="text-sm text-zinc-400">
              Escolha uma senha forte para aumentar a segurança da sua conta.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {error && (
  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
    <p className="text-sm text-red-300">
      {error}
    </p>
  </div>
)}

{success && (
  <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
    <p className="text-sm text-green-300">
      {success}
    </p>
  </div>
)}

          {/* Senha Atual */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Senha Atual
            </label>

            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-white outline-none transition focus:border-violet-500"
              />

              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Nova Senha
            </label>

            <div className="relative">

              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-white outline-none transition focus:border-violet-500"
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Confirmar Nova Senha
            </label>

            <div className="relative">

              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-white outline-none transition focus:border-violet-500"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

            </div>
          </div>

          {/* Aviso */}
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
            <p className="text-sm text-zinc-300">
              Sua nova senha deve possuir pelo menos <strong>8 caracteres</strong>,
              incluindo letras e números para maior segurança.
            </p>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Atualizando..." : "Atualizar Senha"}
          </button>

        </form>

      </div>

    </div>
  );
}

