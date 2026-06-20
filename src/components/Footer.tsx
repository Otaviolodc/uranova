import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">

        <div>
          <h3 className="text-2xl font-bold text-violet-500">
            Uranova
          </h3>

          <p className="text-zinc-400 mt-4">
            Plataforma completa para vender produtos digitais.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">
            Produto
          </h4>

          <ul className="space-y-2 text-zinc-400">
            <li>Área de Membros</li>
            <li>Analytics</li>
            <li>Checkout</li>
            <li>Marketplace</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">
            Empresa
          </h4>

          <ul className="space-y-2 text-zinc-400">
            <li>Sobre</li>
            <li>Contato</li>
            <li>Suporte</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">
            Legal
          </h4>

          <ul className="space-y-2 text-zinc-400">
            <li>Privacidade</li>
            <li>Termos de Uso</li>
          </ul>
        </div>

      </div>

      <div className="text-center text-zinc-500 text-sm mt-10">
        © {new Date().getFullYear()} Uranova. Todos os direitos reservados.
      </div>
    </footer>
  );
}