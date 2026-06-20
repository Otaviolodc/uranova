import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-32 px-6">

      <div className="max-w-6xl mx-auto">

        <div
          className="
            relative
            overflow-hidden
            rounded-[40px]
            border
            border-violet-500/20
            bg-gradient-to-br
            from-violet-600
            via-violet-700
            to-violet-900
            px-8
            py-16
            md:px-16
            md:py-24
            text-center
            shadow-2xl
            shadow-violet-900/40
          "
        >

          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-white/10 blur-[200px] rounded-full" />

          <div className="relative z-10">

            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/20
                bg-white/10
                px-5
                py-2
                text-sm
              "
            >
              Plataforma completa para criadores digitais
            </span>

            <h2 className="mt-8 text-4xl md:text-6xl font-bold leading-tight">
              Transforme seguidores
              <br />
              em clientes.
            </h2>

            <p className="max-w-3xl mx-auto mt-8 text-lg text-violet-100 leading-relaxed">
              Venda cursos, e-books, mentorias e assinaturas.
              Crie sua área de membros, acompanhe métricas,
              receba pagamentos e gerencie todo o seu negócio
              digital em um único lugar.
            </p>

            {/* BENEFÍCIOS */}
            <div className="flex flex-wrap justify-center gap-8 mt-10 text-sm">

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

            {/* BOTÃO */}
            <div className="mt-14">

              <Link
                href="/login"
                className="
                  inline-flex
                  items-center
                  gap-3
                  rounded-2xl
                  bg-white
                  px-10
                  py-5
                  text-black
                  font-bold
                  transition
                  hover:scale-105
                  shadow-xl
                "
              >
                Criar Conta Gratuitamente

                <ArrowRight size={20} />

              </Link>

            </div>

            <p className="mt-8 text-sm text-violet-200">
              Comece hoje e centralize todo o seu negócio digital na Uranova.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}

