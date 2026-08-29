"use client";

import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="w-full p-6 md:p-8 text-white">

      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <div className="mb-10">

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
          👤 Área da conta
        </div>

        <div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Meu Perfil
          </h1>

          <p className="text-zinc-400 mt-3 text-base md:text-lg max-w-3xl">
            Gerencie seu perfil, sua conta e acesse rapidamente
            as principais ferramentas da Uranova.
          </p>

        </div>

      </div>


      {/* ========================================================= */}
      {/* ACESSOS RÁPIDOS */}
      {/* ========================================================= */}

      <div className="mb-5">

        <h2 className="text-2xl md:text-3xl font-black">
          Acessos rápidos
        </h2>

        <p className="text-zinc-500 mt-1">
          Encontre rapidamente o que você precisa.
        </p>

      </div>


      <div className="grid gap-5 md:grid-cols-2">


        {/* ======================================================= */}
        {/* EDITAR PERFIL */}
        {/* ======================================================= */}

        <button
          onClick={() =>
            router.push("/dashboard/settings")
          }
          className="
            group
            relative
            overflow-hidden
            bg-zinc-900
            border
            border-zinc-800
            rounded-[28px]
            p-7
            text-left
            hover:border-green-500/50
            hover:-translate-y-1
            hover:shadow-2xl
            transition-all
            duration-300
          "
        >

          <div
            className="
              absolute
              -right-12
              -top-12
              w-32
              h-32
              rounded-full
              bg-green-500/5
              blur-2xl
              group-hover:bg-green-500/10
              transition
            "
          />

          <div className="relative">

            <div
              className="
                w-13
                h-13
                rounded-2xl
                bg-green-500/10
                border
                border-green-500/20
                flex
                items-center
                justify-center
                text-xl
                mb-5
                group-hover:bg-green-500
                group-hover:text-black
                transition-all
                duration-300
              "
            >
              ✏️
            </div>

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-xl font-black">
                  Editar Perfil
                </h2>

                <p className="text-zinc-400 mt-2 leading-relaxed">
                  Altere sua foto, bio, redes sociais e personalize
                  sua página pública.
                </p>

              </div>

              <span
                className="
                  hidden
                  sm:flex
                  w-9
                  h-9
                  rounded-xl
                  bg-zinc-950
                  border
                  border-zinc-800
                  items-center
                  justify-center
                  text-zinc-500
                  group-hover:text-green-400
                  group-hover:border-green-500/30
                  transition
                "
              >
                →
              </span>

            </div>

            <div className="mt-5 text-green-400 font-bold text-sm">
              Personalizar perfil →
            </div>

          </div>

        </button>


        {/* ======================================================= */}
        {/* CONTA */}
        {/* ======================================================= */}

        <button
          onClick={() =>
            router.push("/dashboard/account")
          }
          className="
            group
            relative
            overflow-hidden
            bg-zinc-900
            border
            border-zinc-800
            rounded-[28px]
            p-7
            text-left
            hover:border-blue-500/50
            hover:-translate-y-1
            hover:shadow-2xl
            transition-all
            duration-300
          "
        >

          <div
            className="
              absolute
              -right-12
              -top-12
              w-32
              h-32
              rounded-full
              bg-blue-500/5
              blur-2xl
              group-hover:bg-blue-500/10
              transition
            "
          />

          <div className="relative">

            <div
              className="
                w-13
                h-13
                rounded-2xl
                bg-blue-500/10
                border
                border-blue-500/20
                flex
                items-center
                justify-center
                text-xl
                mb-5
                group-hover:bg-blue-500
                group-hover:text-black
                transition-all
                duration-300
              "
            >
              ⚙️
            </div>

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-xl font-black">
                  Conta
                </h2>

                <p className="text-zinc-400 mt-2 leading-relaxed">
                  Consulte seus dados da conta, informações cadastrais,
                  segurança e configurações.
                </p>

              </div>

              <span
                className="
                  hidden
                  sm:flex
                  w-9
                  h-9
                  rounded-xl
                  bg-zinc-950
                  border
                  border-zinc-800
                  items-center
                  justify-center
                  text-zinc-500
                  group-hover:text-blue-400
                  group-hover:border-blue-500/30
                  transition
                "
              >
                →
              </span>

            </div>

            <div className="mt-5 text-blue-400 font-bold text-sm">
              Gerenciar conta →
            </div>

          </div>

        </button>


        {/* ======================================================= */}
        {/* SIMULADOR */}
        {/* ======================================================= */}

        <button
          onClick={() =>
            router.push("/dashboard/finance/simulator")
          }
          className="
            group
            relative
            overflow-hidden
            bg-gradient-to-br
            from-green-500/10
            via-zinc-900
            to-zinc-900
            border
            border-green-500/30
            rounded-[28px]
            p-7
            text-left
            hover:border-green-500
            hover:-translate-y-1
            hover:shadow-2xl
            transition-all
            duration-300
          "
        >

          {/* brilho */}

          <div
            className="
              absolute
              -right-16
              -top-16
              w-44
              h-44
              rounded-full
              bg-green-500/10
              blur-3xl
              group-hover:bg-green-500/20
              transition
            "
          />

          <div className="relative">

            <div className="flex items-start justify-between gap-4">

              <div
                className="
                  w-13
                  h-13
                  rounded-2xl
                  bg-green-500
                  flex
                  items-center
                  justify-center
                  text-xl
                  mb-5
                  text-black
                  shadow-lg
                  shadow-green-500/20
                  group-hover:scale-105
                  transition
                "
              >
                🧮
              </div>

              <span
                className="
                  px-3
                  py-1.5
                  rounded-full
                  bg-green-500/10
                  border
                  border-green-500/20
                  text-green-400
                  text-xs
                  font-black
                "
              >
                FINANCEIRO
              </span>

            </div>

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-xl font-black">
                  Simulador
                </h2>

                <p className="text-zinc-400 mt-2 leading-relaxed">
                  Simule suas vendas, consulte as taxas e descubra
                  quanto você recebe em cada transação.
                </p>

              </div>

              <span
                className="
                  hidden
                  sm:flex
                  w-9
                  h-9
                  rounded-xl
                  bg-green-500/10
                  border
                  border-green-500/20
                  items-center
                  justify-center
                  text-green-400
                  group-hover:bg-green-500
                  group-hover:text-black
                  transition
                "
              >
                →
              </span>

            </div>

            <div className="mt-5 text-green-400 font-bold text-sm">
              Abrir simulador →
            </div>

          </div>

        </button>


        {/* ======================================================= */}
        {/* SAIR */}
        {/* ======================================================= */}

        <button
          onClick={() =>
            router.push("/auth/logout")
          }
          className="
            group
            relative
            overflow-hidden
            bg-zinc-900
            border
            border-red-900/60
            rounded-[28px]
            p-7
            text-left
            hover:border-red-500/70
            hover:-translate-y-1
            hover:shadow-2xl
            transition-all
            duration-300
          "
        >

          <div
            className="
              absolute
              -right-12
              -top-12
              w-32
              h-32
              rounded-full
              bg-red-500/5
              blur-2xl
              group-hover:bg-red-500/10
              transition
            "
          />

          <div className="relative">

            <div
              className="
                w-13
                h-13
                rounded-2xl
                bg-red-500/10
                border
                border-red-500/20
                flex
                items-center
                justify-center
                text-xl
                mb-5
                group-hover:bg-red-500
                group-hover:text-black
                transition-all
                duration-300
              "
            >
              🚪
            </div>

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-xl font-black text-red-400">
                  Sair da Conta
                </h2>

                <p className="text-zinc-400 mt-2 leading-relaxed">
                  Encerre sua sessão com segurança neste dispositivo.
                </p>

              </div>

              <span
                className="
                  hidden
                  sm:flex
                  w-9
                  h-9
                  rounded-xl
                  bg-zinc-950
                  border
                  border-zinc-800
                  items-center
                  justify-center
                  text-zinc-500
                  group-hover:text-red-400
                  group-hover:border-red-500/30
                  transition
                "
              >
                →
              </span>

            </div>

            <div className="mt-5 text-red-400 font-bold text-sm">
              Encerrar sessão →
            </div>

          </div>

        </button>

      </div>


      {/* ========================================================= */}
      {/* RODAPÉ INFORMATIVO */}
      {/* ========================================================= */}

      <div
        className="
          mt-8
          bg-zinc-900/70
          border
          border-zinc-800
          rounded-[28px]
          p-6
          md:p-7
        "
      >

        <div className="flex items-start gap-4">

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
              shrink-0
            "
          >
            💡
          </div>

          <div>

            <h3 className="font-bold text-white">
              Tudo em um só lugar
            </h3>

            <p className="text-zinc-500 text-sm mt-1 leading-relaxed max-w-3xl">
              Use esta área para gerenciar sua conta Uranova,
              personalizar seu perfil e acessar rapidamente
              ferramentas importantes da sua operação.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}