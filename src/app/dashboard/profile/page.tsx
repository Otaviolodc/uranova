import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
  data: { session },
} = await supabase.auth.getSession();

const user = session?.user;

  console.log("USER PROFILE:", user);

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
    .select(`
      name,
      username,
      avatar_url,
      phone,
      city,
      state,
      address,
      is_pro,
      created_at
    `)
    .eq("id", user.id)
    .single();

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

return (

    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <div className="flex flex-col md:flex-row items-center gap-8">

          <Image
            src={profile.avatar_url || "/logo.png"}
            alt="Avatar"
            width={128}
            height={128}
            loading="eager"
            priority
            className="
              w-32
              h-32
              rounded-full
              object-cover
              border-4
              border-green-500
            "
          />

          <div>

            <h1 className="text-4xl font-black text-white">
              {profile.name || "Usuário"}
            </h1>

            <p className="text-zinc-400 mt-2">
              @{profile.username}
            </p>

            <div className="mt-4">

              <span
                className="
                  bg-green-500
                  text-black
                  px-4
                  py-2
                  rounded-full
                  font-bold
                "
              >
                {profile.is_pro ? "PRO" : "FREE"}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* DADOS PESSOAIS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-8">
          👤 Dados Pessoais
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <p className="text-zinc-400 text-sm">
              Email
            </p>

            <div className="mt-2 bg-black rounded-2xl p-4 text-white">
              {user.email}
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-sm">
              Telefone
            </p>

            <div className="mt-2 bg-black rounded-2xl p-4 text-white">
              {profile.phone || "-"}
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-sm">
              Cidade
            </p>

            <div className="mt-2 bg-black rounded-2xl p-4 text-white">
              {profile.city || "-"}
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-sm">
              Estado
            </p>

            <div className="mt-2 bg-black rounded-2xl p-4 text-white">
              {profile.state || "-"}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-zinc-400 text-sm">
              Endereço
            </p>

            <div className="mt-2 bg-black rounded-2xl p-4 text-white">
              {profile.address || "-"}
            </div>
          </div>

        </div>

      </div>

      {/* CONTA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-6">
          📅 Conta
        </h2>

        <p className="text-zinc-300">
          Criada em:
        </p>

        <h3 className="text-xl font-bold text-green-400 mt-2">
          {profile.created_at
            ? new Date(profile.created_at).toLocaleDateString("pt-BR")
            : "-"}
        </h3>

      </div>

      {/* BOTÕES */}
      <div className="flex flex-wrap gap-4">

        <Link
          href="/dashboard/settings"
          className="
            bg-green-600
            hover:bg-green-500
            transition
            px-6
            py-4
            rounded-2xl
            font-bold
            text-white
          "
        >
          🎨 Editar Aparência
        </Link>

        <Link
          href="/dashboard/account"
          className="
            bg-zinc-800
            hover:bg-zinc-700
            transition
            px-6
            py-4
            rounded-2xl
            font-bold
            text-white
          "
        >
          ⚙ Configurações da Conta
        </Link>

      </div>

    </div>
  );
}