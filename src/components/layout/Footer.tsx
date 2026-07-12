import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-32">

      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="
               grid
               md:grid-cols-4
               gap-10
               xl:gap-16">

          {/* LOGO */}
          <div>

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

            <p className="text-zinc-400 mt-5 leading-relaxed">
              Plataforma completa para vender cursos,
              e-books, mentorias, assinaturas e criar
              uma estrutura digital profissional.
            </p>

          </div>

          {/* PRODUTO */}
          <div>

            <h4 className="font-bold mb-5 text-white">
              Produto
            </h4>

            <ul className="space-y-3 text-zinc-400 text-sm">

              <li>
                <Link
                  href="/"
                  className="
                    hover:text-white
                    transition-colors
                    duration-200
                  "
                >
                    Área de Membros
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="
                    hover:text-white
                    transition-colors
                    duration-200
                  "
                >
                    Analytics
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="
                    hover:text-white
                    transition-colors
                    duration-200
                  "
                >
                    Checkout
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="
                    hover:text-white
                    transition-colors
                    duration-200
                  "
                >
                    Marketplace
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="
                    hover:text-white
                    transition-colors
                    duration-200
                  "
                >
                    Página de Links
                </Link>
              </li>

            </ul>

          </div>

          {/* EMPRESA */}
          <div>

            <h4 className="font-bold mb-5 text-white">
              Empresa
            </h4>

            <ul className="space-y-3 text-zinc-400 text-sm">

              <li>Sobre</li>

              <li>Contato</li>

              <li>Suporte</li>

              <li>Blog</li>

            </ul>

          </div>

          {/* LEGAL */}
          <div>

            <h4 className="font-bold mb-5 text-white">
              Legal
            </h4>

            <ul className="space-y-3 text-zinc-400 text-sm">

              <li>Privacidade</li>

              <li>Termos de Uso</li>

              <li>Cookies</li>

            </ul>

          </div>

        </div>

        {/* LINHA */}
        <div
          className="
            border-t
            border-zinc-800
            mt-16
            pt-8
            flex
            flex-col
            md:flex-row
            justify-between
            items-center
            gap-4
          "
        >

          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Uranova. Todos os direitos reservados.
          </p>

          <p className="text-zinc-500 text-sm">
            Desenvolvido para criadores digitais.
          </p>

        </div>

      </div>

    </footer>
  );
}

