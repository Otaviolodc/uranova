"use client";

import { useMemo, useState } from "react";

const URANOVA_COMMISSION = 10;

const STRIPE = {
  cardPercent: 3.99,
  cardFixed: 0.39,
  pixPercent: 1.19,
};

type PaymentMethod = "card" | "pix";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PlanPage() {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("card");

  const [simulationValue, setSimulationValue] =
    useState("100");

  const calculation = useMemo(() => {
    const sale = Math.max(
      0,
      Number(
        simulationValue
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
      ) || 0
    );

    const uranovaFee =
      sale * (URANOVA_COMMISSION / 100);

    let stripeFee = 0;

    if (paymentMethod === "card") {
      stripeFee =
        sale * (STRIPE.cardPercent / 100) +
        STRIPE.cardFixed;
    } else {
      stripeFee =
        sale * (STRIPE.pixPercent / 100);
    }

    const received =
      Math.max(0, sale - uranovaFee - stripeFee);

    return {
      sale,
      uranovaFee,
      stripeFee,
      received,
    };
  }, [simulationValue, paymentMethod]);

  return (
    <div className="w-full p-6 md:p-8 text-white">

      {/* HEADER */}
      <div className="mb-8">

        <div
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-green-500/10
            border
            border-green-500/20
            text-green-400
            text-sm
            font-bold
            mb-4
          "
        >
          💎 Plano Uranova
        </div>

        <h1 className="text-4xl md:text-5xl font-black">
          Meu Plano
        </h1>

        <p className="text-zinc-400 mt-3 text-base md:text-lg max-w-3xl">
          Entenda suas taxas, comissões, recebimentos e
          quanto você recebe em cada venda.
        </p>

      </div>

      {/* PLANO ATUAL */}
      <div
        className="
          bg-gradient-to-br
          from-green-500/15
          via-zinc-900
          to-zinc-900
          border
          border-green-500/30
          rounded-[32px]
          p-6
          md:p-8
          mb-8
        "
      >

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-6
          "
        >

          <div>

            <p className="text-xs uppercase tracking-wider text-green-400 font-bold">
              Seu plano atual
            </p>

            <h2 className="text-3xl md:text-4xl font-black mt-2">
              FREE
            </h2>

            <p className="text-zinc-400 mt-2">
              Venda seus produtos dentro da Uranova
              e acompanhe seus resultados.
            </p>

          </div>

          <div
            className="
              px-5
              py-3
              rounded-2xl
              bg-green-500
              text-black
              font-black
              text-center
            "
          >
            Plano ativo
          </div>

        </div>

      </div>

      {/* RESUMO DAS TAXAS */}
      <div className="mb-8">

        <div className="mb-5">

          <h2 className="text-2xl md:text-3xl font-black">
            Como funciona uma venda
          </h2>

          <p className="text-zinc-500 mt-1">
            Veja para onde vai o dinheiro de cada venda.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* URANOVA */}
          <div
            className="
              bg-zinc-900
              border
              border-green-500/20
              rounded-[28px]
              p-6
            "
          >

            <div className="text-2xl mb-4">
              🟢
            </div>

            <p className="text-zinc-400 text-sm">
              Comissão Uranova
            </p>

            <h3 className="text-3xl font-black text-green-400 mt-2">
              {URANOVA_COMMISSION}%
            </h3>

            <p className="text-zinc-500 text-sm mt-3">
              Comissão da plataforma sobre cada venda aprovada.
            </p>

          </div>

          {/* STRIPE */}
          <div
            className="
              bg-zinc-900
              border
              border-blue-500/20
              rounded-[28px]
              p-6
            "
          >

            <div className="text-2xl mb-4">
              💳
            </div>

            <p className="text-zinc-400 text-sm">
              Taxa Stripe
            </p>

            <h3 className="text-2xl font-black text-blue-400 mt-2">
              3,99% + R$ 0,39
            </h3>

            <p className="text-zinc-500 text-sm mt-3">
              Tarifa padrão informada pela Stripe para
              cartões nacionais.
            </p>

          </div>

          {/* PRODUTOR */}
          <div
            className="
              bg-zinc-900
              border
              border-yellow-500/20
              rounded-[28px]
              p-6
            "
          >

            <div className="text-2xl mb-4">
              💰
            </div>

            <p className="text-zinc-400 text-sm">
              Seu recebimento
            </p>

            <h3 className="text-3xl font-black text-yellow-400 mt-2">
              Valor líquido
            </h3>

            <p className="text-zinc-500 text-sm mt-3">
              O valor restante após as taxas aplicáveis.
            </p>

          </div>

        </div>

      </div>

      {/* SIMULADOR */}
      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-[32px]
          p-6
          md:p-8
          mb-8
        "
      >

        <div className="mb-7">

          <div className="flex items-center gap-3">

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-green-500/10
                border
                border-green-500/20
                flex
                items-center
                justify-center
                text-xl
              "
            >
              🧮
            </div>

            <div>

              <h2 className="text-2xl font-black">
                Simule uma venda
              </h2>

              <p className="text-zinc-500 text-sm">
                Veja quanto você receberia de uma venda.
              </p>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">

          {/* CONTROLES */}
          <div>

            <label className="text-sm text-zinc-400 block mb-2">
              Valor da venda
            </label>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                R$
              </span>

              <input
                type="text"
                inputMode="decimal"
                value={simulationValue}
                onChange={(e) =>
                  setSimulationValue(e.target.value)
                }
                className="
                  w-full
                  bg-zinc-950
                  border
                  border-zinc-800
                  rounded-2xl
                  py-4
                  pl-12
                  pr-4
                  text-xl
                  font-bold
                  text-white
                  outline-none
                  focus:border-green-500
                  transition
                "
              />

            </div>

            <div className="mt-6">

              <p className="text-sm text-zinc-400 mb-3">
                Forma de pagamento
              </p>

              <div className="grid grid-cols-2 gap-3">

                <button
                  onClick={() =>
                    setPaymentMethod("card")
                  }
                  className={`
                    rounded-2xl
                    border
                    p-4
                    text-left
                    transition
                    ${
                      paymentMethod === "card"
                        ? "border-green-500 bg-green-500/10"
                        : "border-zinc-800 bg-zinc-950"
                    }
                  `}
                >

                  <div className="text-xl mb-2">
                    💳
                  </div>

                  <p className="font-bold">
                    Cartão
                  </p>

                  <p className="text-xs text-zinc-500 mt-1">
                    3,99% + R$ 0,39
                  </p>

                </button>

                <button
                  onClick={() =>
                    setPaymentMethod("pix")
                  }
                  className={`
                    rounded-2xl
                    border
                    p-4
                    text-left
                    transition
                    ${
                      paymentMethod === "pix"
                        ? "border-green-500 bg-green-500/10"
                        : "border-zinc-800 bg-zinc-950"
                    }
                  `}
                >

                  <div className="text-xl mb-2">
                    ⚡
                  </div>

                  <p className="font-bold">
                    Pix
                  </p>

                  <p className="text-xs text-zinc-500 mt-1">
                    1,19%
                  </p>

                </button>

              </div>

            </div>

          </div>

          {/* RESULTADO */}
          <div
            className="
              bg-zinc-950
              border
              border-zinc-800
              rounded-[28px]
              p-6
            "
          >

            <p className="text-zinc-500 text-sm">
              Em uma venda de
            </p>

            <h3 className="text-3xl font-black mt-1">
              {formatCurrency(calculation.sale)}
            </h3>

            <div className="h-px bg-zinc-800 my-5" />

            <div className="space-y-4">

              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">
                  Comissão Uranova
                </span>

                <span className="text-red-400 font-bold">
                  - {formatCurrency(calculation.uranovaFee)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">
                  Taxa Stripe
                </span>

                <span className="text-red-400 font-bold">
                  - {formatCurrency(calculation.stripeFee)}
                </span>
              </div>

            </div>

            <div className="h-px bg-zinc-800 my-5" />

            <div className="flex justify-between items-end gap-4">

              <div>

                <p className="text-zinc-500 text-sm">
                  Você recebe
                </p>

                <p className="text-3xl font-black text-green-400 mt-1">
                  {formatCurrency(calculation.received)}
                </p>

              </div>

              <span className="text-green-400 text-sm font-bold">
                Líquido
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* FLUXO DO DINHEIRO */}
      <div className="mb-8">

        <div className="mb-5">

          <h2 className="text-2xl md:text-3xl font-black">
            Seu dinheiro, passo a passo
          </h2>

          <p className="text-zinc-500 mt-1">
            Entenda o fluxo financeiro de uma venda.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-[24px]
              p-5
            "
          >

            <span className="text-2xl">
              01
            </span>

            <h3 className="font-black mt-4">
              Cliente compra
            </h3>

            <p className="text-zinc-500 text-sm mt-2">
              O cliente realiza o pagamento pelo checkout
              da Uranova.
            </p>

          </div>

          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-[24px]
              p-5
            "
          >

            <span className="text-2xl">
              02
            </span>

            <h3 className="font-black mt-4">
              Pagamento processado
            </h3>

            <p className="text-zinc-500 text-sm mt-2">
              A Stripe processa o pagamento e aplica sua
              tarifa correspondente.
            </p>

          </div>

          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-[24px]
              p-5
            "
          >

            <span className="text-2xl">
              03
            </span>

            <h3 className="font-black mt-4">
              Comissão Uranova
            </h3>

            <p className="text-zinc-500 text-sm mt-2">
              A comissão da plataforma é descontada
              conforme as regras da Uranova.
            </p>

          </div>

          <div
            className="
              bg-green-500/5
              border
              border-green-500/20
              rounded-[24px]
              p-5
            "
          >

            <span className="text-2xl">
              04
            </span>

            <h3 className="font-black mt-4 text-green-400">
              Saldo disponível
            </h3>

            <p className="text-zinc-500 text-sm mt-2">
              Depois da liquidação e das regras de
              disponibilidade, o valor fica disponível
              para saque.
            </p>

          </div>

        </div>

      </div>

      {/* SAQUE */}
      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-[32px]
          p-6
          md:p-8
          mb-8
        "
      >

        <div className="flex items-start gap-4">

          <div
            className="
              w-12
              h-12
              rounded-2xl
              bg-green-500/10
              border
              border-green-500/20
              flex
              items-center
              justify-center
              text-xl
              shrink-0
            "
          >
            💸
          </div>

          <div>

            <h2 className="text-xl md:text-2xl font-black">
              Saques
            </h2>

            <p className="text-zinc-400 mt-2 leading-relaxed">
              O saldo de vendas aprovadas será acompanhado
              na área financeira. Após o valor estar disponível
              para saque, você poderá solicitar a retirada
              conforme as regras da Uranova.
            </p>

          </div>

        </div>

      </div>

      {/* OBSERVAÇÃO */}
      <div
        className="
          rounded-[24px]
          bg-blue-500/5
          border
          border-blue-500/20
          p-5
        "
      >

        <p className="text-blue-300 text-sm leading-relaxed">
          ℹ️ As tarifas da Stripe podem variar conforme a
          forma de pagamento, tipo de cartão, moeda e condições
          específicas da conta. Os valores exibidos nesta página
          são uma referência e não substituem o detalhamento
          financeiro da transação.
        </p>

      </div>

    </div>
  );
}