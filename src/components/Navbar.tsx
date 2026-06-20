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
          h-20
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
            from-violet-400
            to-fuchsia-500
            bg-clip-text
            text-transparent
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
            text-zinc-400
          "
        >
          <a
            href="#produtos"
            className="hover:text-white transition"
          >
            Produtos
          </a>

          <a
            href="#recursos"
            className="hover:text-white transition"
          >
            Recursos
          </a>

          <a
            href="#membros"
            className="hover:text-white transition"
          >
            Área de Membros
          </a>

          <a
            href="#faq"
            className="hover:text-white transition"
          >
            FAQ
          </a>
        </nav>

        {/* Botões */}
        <div className="flex items-center gap-3">

          <Link
            href="/login"
            className="
              px-5
              py-2.5
              rounded-xl
              border
              border-zinc-700
              hover:border-zinc-500
              transition
            "
          >
            Entrar
          </Link>

          <Link
            href="/login"
            className="
              px-5
              py-2.5
              rounded-xl
              bg-violet-600
              hover:bg-violet-700
              transition
              font-semibold
              shadow-lg
              shadow-violet-600/20
            "
          >
            Criar Conta
          </Link>

        </div>
      </div>
    </header>
  );
}