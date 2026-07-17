import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface UserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserPage({
  params,
}: UserPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: user } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      username,
      avatar_url,
      phone,
      city,
      state,
      address,
      instagram,
      telegram,
      whatsapp,
      role,
      created_at
    `)
    .eq("id", id)
    .single();

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>

        <h1 className="text-4xl font-bold">
          {user.name || "Sem nome"}
        </h1>

        <p className="text-zinc-400 mt-2">
          Perfil do usuário
        </p>

      </div>

      {/* CARD */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <h2 className="text-xl font-bold mb-6">
          Informações do usuário
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <p className="text-zinc-500 text-sm">Nome</p>
            <p>{user.name || "-"}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Username</p>
            <p>@{user.username || "-"}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Telefone</p>
            <p>{user.phone || "-"}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Cidade</p>
            <p>{user.city || "-"}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Estado</p>
            <p>{user.state || "-"}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Cadastro</p>
            <p>
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("pt-BR")
                : "-"}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}