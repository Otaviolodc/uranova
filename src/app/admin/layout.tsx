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
    data: { session },
  } = await supabase.auth.getSession();

  // NÃO LOGADO
  if (!session) {
    redirect("/login");
  }

  // PROFILE
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  // NÃO ADMIN
  if (profile?.role !== "admin") {
    redirect("/dashboard/links");
  }

  return (

    <div className="min-h-screen flex">

      {/* SIDEBAR */}
      <aside className="
        w-64
        h-screen
        sticky
        top-0
        bg-zinc-950
        border-r
        border-zinc-800
        p-6
        text-white
      ">

        <h2 className="
          text-2xl
          font-bold
          mb-10
        ">

          PromoLink Admin

        </h2>

        <nav className="flex flex-col gap-3">

          <a
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
          </a>

          <a
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
          </a>

          <a
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
          </a>

          <a
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
          </a>

          <a
            href="/admin/analytics"
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
            Analytics
          </a>

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
      <main className="
        flex-1
        bg-black
        text-white
        p-10
      ">

        {/* TOPBAR */}
        <header className="
          mb-10
          flex
          items-center
          justify-between
        ">

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

              Controle total do PromoLink

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