import Link from "next/link";

export default function Navbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-white/5
        bg-black/70
        backdrop-blur-xl
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          min-h-20 py-3 lg:py-0 flex-wrap gap-3 lg:h-20
          flex
          items-center
          justify-between
        "
      >
        {/* Logo */}
        <Link
          href="/"
          className="
            text-3xl
            font-extrabold
            bg-gradient-to-r
            from-green-400
            to-green-600
            bg-clip-text
            text-transparent
            transition
            hover:opacity-90
          "
        >
          Uranova
        </Link>

        {/* Menu */}
        <nav
          className="
            hidden
            lg:flex
            items-center
            gap-10
            text-sm
            font-medium
            text-zinc-400
          "
        >
          <Link
            href="#produtos"
            className="
            hover:text-white
            transition-colors
            duration-200
            "
          >
            Produtos
          </Link>

          <Link
            href="#recursos"
            className="
            hover:text-white
            transition-colors
            duration-200
            "
          >
            Recursos
          </Link>

          <Link
            href="#membros"
            className="
            hover:text-white
            transition-colors
            duration-200
            "
          >
            Área de Membros
          </Link>

          <Link
            href="#faq"
            className="
            hover:text-white
            transition-colors
            duration-200
            "
          >
            FAQ
          </Link>
        </nav>

        <details className="relative lg:hidden">
          <summary className="cursor-pointer rounded-xl border border-zinc-700 px-4 py-3">Menu</summary>
          <nav aria-label="Menu principal" className="absolute right-0 top-full z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-700 bg-zinc-950 p-2">
            <Link className="block rounded-lg p-3" href="/#produtos">Produtos</Link>
            <Link className="block rounded-lg p-3" href="/#recursos">Recursos</Link>
            <Link className="block rounded-lg p-3" href="/#membros">Área de Membros</Link>
            <Link className="block rounded-lg p-3" href="/#faq">FAQ</Link>
          </nav>
        </details>

        {/* Botões */}
        <div className="flex flex-wrap items-center gap-3">

          <Link
            href="/auth/login"
            className="
              px-3 sm:px-5
              py-2.5
              rounded-xl
              border
              border-zinc-700
              font-medium
              hover:border-zinc-500
              hover:bg-zinc-900
              transition
            "
          >
            Entrar
          </Link>

          <Link
            href="/auth/login"
            className="
              px-3 sm:px-5
              py-2.5
              rounded-xl
              bg-green-500
              hover:bg-green-600
              hover:scale-[1.03]
              transition-all
              duration-300
              font-semibold
              shadow-lg
              shadow-green-500/20
            "
          >
            Criar Conta
          </Link>

        </div>
      </div>
    </header>
  );
}