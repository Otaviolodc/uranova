import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-violet-500"
        >
          Uranova
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300">
          <a href="#produtos">Produtos</a>
          <a href="#recursos">Recursos</a>
          <a href="#membros">Área de Membros</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500"
          >
            Entrar
          </Link>

          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 font-semibold"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </header>
  );
}