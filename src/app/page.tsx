import Link from "next/link";

export default function HomePage() {

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">

      <div className="max-w-6xl w-full">

        {/* HERO */}

        <div className="text-center mb-20">

          <h1 className="text-7xl font-bold mb-6">
            Uranova
          </h1>

          <p className="text-zinc-400 text-2xl max-w-3xl mx-auto leading-relaxed">
            Crie páginas de links profissionais,
            acompanhe cliques e monetize seus produtos
            com um sistema moderno e automatizado.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">

            <Link
              href="/login"
              className="bg-green-500 hover:bg-green-400 transition px-8 py-4 rounded-2xl font-bold text-black text-lg"
            >
              Começar Agora
            </Link>

          </div>

        </div>

        {/* CARDS */}

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <div className="text-5xl mb-6">
              🔗
            </div>

            <h2 className="text-2xl font-bold mb-4">
              Crie Links
            </h2>

            <p className="text-zinc-400 leading-relaxed">
              Adicione produtos, afiliados e ofertas
              em uma página moderna e profissional.
            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <div className="text-5xl mb-6">
              📈
            </div>

            <h2 className="text-2xl font-bold mb-4">
              Analytics
            </h2>

            <p className="text-zinc-400 leading-relaxed">
              Veja cliques, desempenho e métricas
              em tempo real do seu perfil.
            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <div className="text-5xl mb-6">
              💰
            </div>

            <h2 className="text-2xl font-bold mb-4">
              Monetize
            </h2>

            <p className="text-zinc-400 leading-relaxed">
              Venda produtos, assinaturas e links
              premium com integração PIX.
            </p>

          </div>

        </div>

      </div>

    </main>

  );

}