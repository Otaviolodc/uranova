import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

        <div>

          <span className="text-green-500 font-medium">
            Plataforma completa para criadores digitais
          </span>

          <h1 className="text-6xl xl:text-7xl font-bold mt-6 leading-tight">
            Venda cursos,
            <br />
            e-books e
            <br />
            mentorias.
          </h1>

          <p className="text-zinc-400 text-xl mt-8 max-w-xl">
            Crie sua estrutura digital completa em uma única plataforma.
          </p>

          <div className="flex gap-4 mt-10">

            <Link
              href="/auth/login"
              className="
                bg-green-500
                hover:bg-green-600
                hover:shadow-lg
                hover:shadow-green-500/20
                px-8
                py-4
                rounded-2xl
                font-semibold
                flex
                items-center
                gap-2
                transition-all
                duration-300
              "
            >
              Criar conta
              <ArrowRight size={18} />
            </Link>

            <button className="border border-zinc-800 px-8 py-4 rounded-2xl">
              Ver demonstração
            </button>

          </div>

        </div>

        <div className="glass rounded-3xl p-8">

          <h3 className="text-2xl font-bold">
            Dashboard Uranova
          </h3>

          <div className="grid grid-cols-2 gap-4 mt-8">

            <Card title="Receita" value="R$ 12.847" />
            <Card title="Vendas" value="324" />
            <Card title="Produtos" value="18" />
            <Card title="Alunos" value="942" />

          </div>

        </div>

      </div>
    </section>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
      <p className="text-zinc-400">{title}</p>

      <p className="text-3xl font-bold mt-3">
        {value}
      </p>
    </div>
  );
}