"use client";

import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="p-8 text-white max-w-5xl">

      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Meu Perfil
        </h1>

        <p className="text-zinc-400 mt-2">
          Gerencie sua conta e suas configurações.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">

        <button
          onClick={() => router.push("/dashboard/settings")}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-left hover:border-green-500 transition"
        >
          <h2 className="text-xl font-bold mb-2">
            ✏️ Editar Perfil
          </h2>

          <p className="text-zinc-400">
            Altere foto, bio, links e aparência da sua página.
          </p>
        </button>

        <button
          onClick={() => router.push("/dashboard/account")}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-left hover:border-green-500 transition"
        >
          <h2 className="text-xl font-bold mb-2">
            ⚙️ Conta
          </h2>

          <p className="text-zinc-400">
            Veja seu e-mail e informações do plano.
          </p>
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 opacity-70">
          <h2 className="text-xl font-bold mb-2">
            💎 Plano
          </h2>

          <p className="text-zinc-400">
            Em breve.
          </p>
        </div>

        <button
          onClick={() => router.push("/auth/logout")}
          className="
            bg-zinc-900
            border
            border-red-900
            rounded-3xl
            p-6
            text-left
            hover:border-red-500
            transition
          "
        >
          <h2 className="text-xl font-bold mb-2 text-red-400">
            🚪 Sair da Conta
          </h2>

          <p className="text-zinc-400">
            Encerrar a sessão da sua conta.
          </p>
        </button>

      </div>

    </div>
  );
}