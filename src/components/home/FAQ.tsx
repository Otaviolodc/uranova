"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Posso vender cursos online na Uranova?",
    answer:
      "Sim. Você pode criar cursos completos, organizar módulos, adicionar aulas, materiais complementares e liberar o acesso automaticamente após a compra.",
  },
  {
    question: "Posso vender e-books e materiais digitais?",
    answer:
      "Sim. E-books, PDFs, planilhas, templates e outros arquivos digitais podem ser vendidos com entrega automática ao cliente.",
  },
  {
    question: "A Uranova possui área de membros?",
    answer:
      "Sim. Seus alunos recebem acesso a uma área exclusiva para consumir conteúdos, acompanhar módulos e baixar materiais.",
  },
  {
    question: "Posso criar planos de assinatura?",
    answer:
      "Sim. Você pode criar produtos recorrentes e gerar receita mensal através de assinaturas.",
  },
  {
    question: "Como funciona o saque dos valores recebidos?",
    answer:
      "Os valores ficam disponíveis em sua conta e podem ser solicitados através da área financeira da plataforma.",
  },
  {
    question: "A Uranova possui página de links estilo Linktree?",
    answer:
      "Sim. Cada usuário pode criar uma página personalizada para centralizar links, produtos, redes sociais e ofertas.",
  },
  {
    question: "Existe cobrança para criar uma conta?",
    answer:
      "Não. Você pode criar sua conta gratuitamente e começar a configurar sua estrutura digital.",
  },
  {
    question: "Posso acompanhar cliques e vendas?",
    answer:
      "Sim. A plataforma oferece analytics completos com métricas de vendas, conversões, tráfego e desempenho dos produtos.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center max-w-3xl mx-auto">

          <span className="text-violet-400 font-medium">
            Dúvidas frequentes
          </span>

          <h2 className="text-5xl font-bold mt-4">
            Perguntas frequentes
          </h2>

          <p className="text-zinc-400 text-lg mt-6">
            Tire suas dúvidas sobre a plataforma,
            pagamentos, área de membros e vendas digitais.
          </p>

        </div>

        <div className="mt-16 space-y-4">

          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <div
                key={faq.question}
                className="
                  glass
                  rounded-2xl
                  overflow-hidden
                "
              >
                <button
                  onClick={() =>
                    setOpen(isOpen ? null : index)
                  }
                  className="
                    w-full
                    flex
                    items-center
                    justify-between
                    p-6
                    text-left
                  "
                >
                  <span className="font-semibold text-lg">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={22}
                    className={`transition ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-zinc-400 leading-relaxed">
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