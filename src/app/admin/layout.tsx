import Link from "next/link";
import { createClient }
from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const supabase =
    await createClient();

  // SESSION
  const {
  data: { user },
} = await supabase.auth.getUser();

// NÃO LOGADO
if (!user) {
  redirect("/auth/login");
}

// PROFILE
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

const OWNER_EMAIL = process.env.OWNER_EMAIL;

// NÃO ADMIN OU NÃO É O DONO
if (
  !profile ||
  profile.role !== "admin" ||
  !user.email ||
  user.email !== OWNER_EMAIL
) {
  redirect("/dashboard/links");
}

  return (

    <div className="min-h-screen flex flex-col md:flex-row">

      {/* SIDEBAR */}
      <aside
        className="
          w-full
          md:w-64
          bg-zinc-950
          border-b
          md:border-b-0
          md:border-r
          border-zinc-800
          p-4
          md:p-6
          text-white
        "
      >

        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-10">

          Uranova Admin

        </h2>

        <nav className="flex flex-col gap-2 md:flex md:flex-col md:gap-3">

          <Link
            href="/admin"
            className="
              bg-zinc-900
              hover:bg-zinc-800
              hover:translate-x-1
              transition-all
              duration-200
              px-4
              py-3
              rounded-xl
              font-medium
              border
              border-transparent
              hover:border-zinc-700
            "
          >
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className="
              bg-zinc-900
              hover:bg-zinc-800
              hover:translate-x-1
              transition-all
              duration-200
              px-4
              py-3
              rounded-xl
              font-medium
              border
              border-transparent
              hover:border-zinc-700
            "
          >
            Usuários
          </Link>

          <Link
            href="/admin/products"
            className="
              bg-zinc-900
              hover:bg-zinc-800
              hover:translate-x-1
              transition-all
              duration-200
              px-4
              py-3
              rounded-xl
              font-medium
              border
              border-transparent
              hover:border-zinc-700
            "
          >
            Produtos
          </Link>

          <Link
            href="/admin/payments"
            className="
              bg-zinc-900
              hover:bg-zinc-800
              hover:translate-x-1
              transition-all
              duration-200
              px-4
              py-3
              rounded-xl
              font-medium
              border
              border-transparent
              hover:border-zinc-700
            "
          >
            Pagamentos
          </Link>

          <Link
            href="/admin/withdraws"
            className="
              bg-zinc-900
              hover:bg-zinc-800
              hover:translate-x-1
              transition-all
              duration-200
              px-4
              py-3
              rounded-xl
              font-medium
              border
              border-transparent
              hover:border-zinc-700
            "
          >
            Saques
          </Link>

        </nav>

     <a
  href="/auth/logout"
  className="
    block
    w-full
    mt-6
    bg-red-500
    hover:bg-red-400
    transition-all
    duration-200
    px-4
    py-3
    rounded-xl
    font-medium
    text-white
    text-center
  "
>

  Sair da Conta

</a>

</aside>

      {/* MAIN */}
      <main
        className="
          flex-1
          bg-black
          text-white
          p-4
          md:p-10
          overflow-x-hidden
        "
      >

        {/* TOPBAR */}
        <header
          className="
            mb-6
            flex
            flex-col
            gap-4
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          <div>

            <h1 className="
              text-2xl
              font-bold
            ">

              Painel Admin

            </h1>

            <p className="
              text-zinc-400
              text-sm
              mt-1
            ">

              Controle total do Uranova

            </p>

          </div>

          <div className="
            bg-zinc-900
            border
            border-zinc-800
            px-4
            py-2
            rounded-xl
            text-sm
            font-medium
          ">

            Admin

          </div>

        </header>

        {children}

      </main>

    </div>

  );

}