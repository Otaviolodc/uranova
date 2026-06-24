import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {

  const supabase = await createClient();

  const {
  data: { session },
} = await supabase.auth.getSession();

const user = session?.user;

  console.log("USER ACCOUNT:", user);

  if (!user) {
    return (
      <div className="text-zinc-400">
        Usuário não encontrado
      </div>
    );
  }

  const {
    data: profile,
    error,
  } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  console.log("PROFILE ACCOUNT:", profile);
  console.log("ERROR ACCOUNT:", error);

  if (error) {
    console.error(error);
  }

  if (!profile) {
  return (
    <div className="text-zinc-400">
      Perfil não encontrado
    </div>
  );
}

  const isPro = profile?.is_pro ?? false;

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
              {user.email}
            </div>
          </div>

          <a
            href="/auth/reset-password"
            className="
              inline-block
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
          </a>

        </div>

      </div>

      {/* PLANO */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-6">
          ⭐ Plano
        </h2>

        <div className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-6
        ">

          <div>

            <p className="text-zinc-400">
              Plano atual
            </p>

            <h3 className="text-3xl font-black text-green-400 mt-2">
              {isPro ? "PRO" : "FREE"}
            </h3>

          </div>

          {!isPro && (
            <Link
              href="/checkout/pro"
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
            </Link>
             
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