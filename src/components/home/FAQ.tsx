"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Posso vender cursos online na Uranova?",
    answer:
      "Sim. Você pode criar cursos completos, organizar módulos, adicionar aulas e liberar o acesso automaticamente após a compra.",
  },
  {
    question: "Posso vender e-books e materiais digitais?",
    answer:
      "Sim. PDFs, e-books, templates, planilhas e outros materiais digitais podem ser vendidos com entrega automática.",
  },
  {
    question: "A Uranova possui área de membros?",
    answer:
      "Sim. Seus alunos recebem acesso a uma área exclusiva para consumir conteúdos e baixar materiais.",
  },
  {
    question: "Posso criar assinaturas recorrentes?",
    answer:
      "Sim. Você pode criar planos recorrentes e gerar receita previsível todos os meses.",
  },
  {
    question: "Como funciona o saque?",
    answer:
      "Os valores recebidos ficam disponíveis em sua conta e podem ser solicitados através da área financeira.",
  },
  {
    question: "Existe página de links estilo Linktree?",
    answer:
      "Sim. Você pode criar uma página personalizada para divulgar produtos, redes sociais e ofertas.",
  },
  {
    question: "Existe custo para criar uma conta?",
    answer:
      "Não. Você pode criar sua conta gratuitamente e começar a estruturar seu negócio digital.",
  },
  {
    question: "Posso acompanhar vendas e cliques?",
    answer:
      "Sim. A Uranova possui analytics completos com métricas de vendas, conversões e desempenho dos produtos.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-32 px-6"
    >
      <div className="max-w-5xl mx-auto">

        <div className="text-center max-w-3xl mx-auto">

          <span className="text-violet-400 font-medium">
            Dúvidas frequentes
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Perguntas frequentes
          </h2>

          <p className="text-zinc-400 text-lg mt-6 leading-relaxed">
            Tire suas dúvidas sobre pagamentos,
            área de membros, cursos, assinaturas
            e vendas digitais.
          </p>

        </div>

        <div className="space-y-5 mt-20">

          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <div
                key={faq.question}
                className="
                  glass
                  rounded-[28px]
                  border
                  border-white/5
                  overflow-hidden
                  shadow-lg
                  shadow-black/20
                "
              >
                <button
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="
                    w-full
                    flex
                    items-center
                    justify-between
                    p-7
                    text-left
                  "
                >

                  <span className="font-semibold text-lg">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={22}
                    className={`transition duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />

                </button>

                {isOpen && (

                  <div className="px-7 pb-7 text-zinc-400 leading-relaxed">

                    {faq.answer}

                  </div>

                )}

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
