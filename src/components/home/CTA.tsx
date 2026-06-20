import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="relative overflow-hidden rounded-[40px] border border-violet-500/20 bg-gradient-to-br from-violet-600 via-violet-700 to-violet-900 p-12 md:p-20 text-center">

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/10 blur-[180px] rounded-full" />

          <div className="relative z-10">

            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm">
              Plataforma completa para criadores digitais
            </span>

            <h2 className="text-5xl md:text-6xl font-bold mt-8 leading-tight">
              Pronto para transformar
              <br />
              seguidores em clientes?
            </h2>

            <p className="mt-8 text-lg text-violet-100 max-w-3xl mx-auto leading-relaxed">
              Venda cursos, e-books, mentorias, assinaturas,
              crie sua área de membros, receba pagamentos e
              acompanhe seus resultados em uma única plataforma.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm">

              <div className="flex items-center gap-2">
                <CheckCircle size={18} />
                Conta gratuita
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle size={18} />
                Sem cartão de crédito
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle size={18} />
                Configuração rápida
              </div>

            </div>

            <div className="mt-12">

              <Link
                href="/login"
                className="
                  inline-flex
                  items-center
                  gap-3
                  bg-white
                  text-black
                  px-10
                  py-5
                  rounded-2xl
                  font-bold
                  hover:scale-105
                  transition
                "
              >
                Criar Conta Gratuitamente

                <ArrowRight size={20} />
              </Link>

            </div>

            <p className="mt-6 text-sm text-violet-200">
              Comece hoje e centralize todo o seu negócio digital na Uranova.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}