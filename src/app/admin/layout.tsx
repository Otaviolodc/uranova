import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // ======================================================
  // SESSION
  // ======================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // NÃO LOGADO
  if (!user) {
    redirect("/auth/login");
  }

  // ======================================================
  // PROFILE
  // ======================================================

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const OWNER_EMAIL = process.env.OWNER_EMAIL;

  // ======================================================
  // PROTEÇÃO DO ADMIN
  // ======================================================

  if (
    !profile ||
    profile.role !== "admin" ||
    !user.email ||
    user.email !== OWNER_EMAIL
  ) {
    redirect("/dashboard/links");
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className="
          w-full
          md:w-72
          md:min-h-screen
          bg-zinc-950
          border-b
          md:border-b-0
          md:border-r
          border-zinc-800
          flex
          flex-col
          p-4
          md:p-6
        "
      >

        {/* LOGO */}

        <div className="flex items-center justify-center md:justify-start mb-8 md:mb-12">
          <Image
            src="/uranova-logo.svg"
            alt="Uranova"
            width={190}
            height={60}
            priority
            className="object-contain"
          />
        </div>

        {/* ADMIN IDENTIFICATION */}

        <div
          className="
            mb-6
            rounded-2xl
            border
            border-green-500/20
            bg-green-500/5
            p-4
          "
        >
          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-green-500/10
                border
                border-green-500/20
              "
            >
              🛡️
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Administrador
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />

                <span className="text-xs text-green-400">
                  Acesso autorizado
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1">

          {/* VISÃO GERAL */}

          <p
            className="
              mb-3
              px-2
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-zinc-500
            "
          >
            Visão geral
          </p>

          <div className="space-y-2">

            <Link
              href="/admin"
              className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-green-500/20
                bg-green-500/10
                px-4
                py-3
                font-medium
                text-green-400
                transition-all
                duration-200
                hover:bg-green-500/15
              "
            >
              <span className="text-lg">
                📊
              </span>

              <span>
                Dashboard
              </span>
            </Link>

          </div>

          {/* GESTÃO */}

          <p
            className="
              mb-3
              mt-8
              px-2
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-zinc-500
            "
          >
            Gestão
          </p>

          <div className="space-y-2">

            <Link
              href="/admin/users"
              className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-transparent
                bg-zinc-900
                px-4
                py-3
                font-medium
                text-zinc-300
                transition-all
                duration-200
                hover:border-zinc-700
                hover:bg-zinc-800
                hover:text-white
              "
            >
              <span className="text-lg">
                👥
              </span>

              <span>
                Usuários
              </span>
            </Link>

            <Link
              href="/admin/products"
              className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-transparent
                bg-zinc-900
                px-4
                py-3
                font-medium
                text-zinc-300
                transition-all
                duration-200
                hover:border-zinc-700
                hover:bg-zinc-800
                hover:text-white
              "
            >
              <span className="text-lg">
                📦
              </span>

              <span>
                Produtos
              </span>
            </Link>

          </div>

          {/* FINANCEIRO */}

          <p
            className="
              mb-3
              mt-8
              px-2
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-zinc-500
            "
          >
            Financeiro
          </p>

          <div className="space-y-2">

            <Link
              href="/admin/payments"
              className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-transparent
                bg-zinc-900
                px-4
                py-3
                font-medium
                text-zinc-300
                transition-all
                duration-200
                hover:border-zinc-700
                hover:bg-zinc-800
                hover:text-white
              "
            >
              <span className="text-lg">
                💳
              </span>

              <span>
                Pagamentos
              </span>
            </Link>

          </div>

        </nav>

        {/* SYSTEM STATUS */}

        <div
          className="
            mt-8
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900/60
            p-4
          "
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

              <span className="text-sm font-medium text-zinc-300">
                Sistema
              </span>

            </div>

            <span className="text-xs font-semibold text-green-400">
              Online
            </span>

          </div>
        </div>

        {/* LOGOUT */}

        <a
          href="/auth/logout"
          className="
            mt-4
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
            font-medium
            text-red-400
            transition-all
            duration-200
            hover:border-red-500/40
            hover:bg-red-500/15
            hover:text-red-300
          "
        >
          <span>
            🚪
          </span>

          <span>
            Sair da Conta
          </span>
        </a>

      </aside>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main
        className="
          flex-1
          min-w-0
          bg-black
          overflow-x-hidden
        "
      >

        {/* TOPBAR */}

        <header
          className="
            sticky
            top-0
            z-20
            border-b
            border-zinc-900
            bg-black/90
            backdrop-blur-xl
          "
        >

          <div
            className="
              flex
              flex-col
              gap-3
              px-4
              py-4
              md:flex-row
              md:items-center
              md:justify-between
              md:px-10
            "
          >

            <div>

              <h1 className="text-xl font-bold md:text-2xl">
                Painel Admin
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Controle total da Uranova
              </p>

            </div>

            <div
              className="
                flex
                w-fit
                items-center
                gap-2
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900
                px-4
                py-2
                text-sm
                font-medium
                text-zinc-300
              "
            >
              <span className="h-2 w-2 rounded-full bg-green-500" />

              Admin
            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <div className="p-4 md:p-10">
          {children}
        </div>

      </main>

    </div>
  );
}