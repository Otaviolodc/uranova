import UserMenu from "./UserMenu";
import { createClient } from "@/lib/supabase/server";

export default async function Topbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      name,
      avatar_url,
      is_pro
    `)
    .eq("id", user.id)
    .single();

  return (
    <header
      className="
        relative
        h-20
        border-b
        border-zinc-800
        bg-zinc-950/80
        backdrop-blur-xl
        px-8
        flex
        items-center
        justify-between
        z-50
      "
    >
      {/* Pesquisa */}
      <div className="flex-1 max-w-xl">
        <input
          placeholder="🔍 Pesquisar..."
          className="
            w-full
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-5
            py-3
            text-white
            outline-none
            transition
            focus:border-green-500
          "
        />
      </div>

      {/* Direita */}
      <div className="flex items-center gap-4">

        {/* Notificações */}
        <button
          title="Notificações"
          className="
            w-12
            h-12
            rounded-2xl
            bg-zinc-900
            border
            border-zinc-800
            flex
            items-center
            justify-center
            hover:border-green-500
            transition
          "
        >
          🔔
        </button>

        {/* Badge PRO/FREE */}
        <div
          className={`
            hidden
            md:flex
            px-5
            py-3
            rounded-2xl
            font-bold
            text-white
            ${
              profile?.is_pro
                ? "bg-gradient-to-r from-purple-600 to-pink-600"
                : "bg-zinc-800"
            }
          `}
        >
          {profile?.is_pro ? "💎 PRO" : "FREE"}
        </div>

        {/* Menu do usuário */}
        <UserMenu profile={profile} />

      </div>
    </header>
  );
}
