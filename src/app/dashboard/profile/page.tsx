"use client";

import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="w-full p-6 md:p-8 text-white">

      {/* IDENTIDADE DA CONTA */}
      <div
        className="
          w-full
          mb-8
          bg-zinc-900
          border
          border-zinc-800
          rounded-[32px]
          p-6
          md:p-8
          shadow-2xl
        "
      >
        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-6
          "
        >

          {/* IDENTIDADE */}
          <div className="flex items-center gap-5">

            <div
              className="
                w-16
                h-16
                md:w-20
                md:h-20
                rounded-full
                bg-zinc-800
                border
                border-zinc-700
                flex
                items-center
                justify-center
                text-3xl
                shrink-0
              "
            >
              👤
            </div>

            <div>

              <p className="text-xs uppercase tracking-wider text-green-400 font-bold">
                Sua conta Uranova
              </p>

              <h1 className="text-2xl md:text-3xl font-black mt-1">
                Meu Perfil
              </h1>

              <p className="text-zinc-400 mt-1">
                Central de gerenciamento da sua conta.
              </p>

            </div>

          </div>

          {/* STATUS */}
          <div
            className="
              self-start
              md:self-center
              px-4
              py-2
              rounded-full
              bg-green-500/10
              border
              border-green-500/20
              text-green-400
              text-sm
              font-bold
            "
          >
            🟢 Conta ativa
          </div>

        </div>
      </div>

      {/* CARDS */}
      <div
        className="
          w-full
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
          items-stretch
        "
      >

        {/* EDITAR PERFIL */}
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="
            group
            w-full
            h-full
            min-h-[250px]
            bg-zinc-900
            border
            border-zinc-800
            rounded-[28px]
            p-7
            md:p-8
            text-left
            hover:border-green-500/50
            hover:-translate-y-1
            hover:shadow-2xl
            transition-all
            duration-300
            flex
            flex-col
          "
        >

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
              mb-5
              group-hover:bg-green-500
              transition
            "
          >
            ✏️
          </div>

          <h2 className="text-xl font-black">
            Editar Perfil
          </h2>

          <p className="text-zinc-400 mt-2 leading-relaxed">
            Altere sua foto, bio, redes sociais e personalize
            sua página pública.
          </p>

          <div className="mt-auto pt-6 text-green-400 font-bold text-sm">
            Personalizar perfil →
          </div>

        </button>

        {/* CONTA */}
        <button
          onClick={() => router.push("/dashboard/account")}
          className="
            group
            w-full
            h-full
            min-h-[250px]
            bg-zinc-900
            border
            border-zinc-800
            rounded-[28px]
            p-7
            md:p-8
            text-left
            hover:border-blue-500/50
            hover:-translate-y-1
            hover:shadow-2xl
            transition-all
            duration-300
            flex
            flex-col
          "
        >

          <div
            className="
              w-12
              h-12
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
              transition
            "
          >
            ⚙️
          </div>

          <h2 className="text-xl font-black">
            Conta
          </h2>

          <p className="text-zinc-400 mt-2 leading-relaxed">
            Consulte seus dados da conta, informações cadastrais,
            segurança e configurações.
          </p>

          <div className="mt-auto pt-6 text-blue-400 font-bold text-sm">
            Gerenciar conta →
          </div>

        </button>

        {/* PLANO */}
        <button
          onClick={() => router.push("/dashboard/plan")}
          className="
            group
            w-full
            h-full
            min-h-[250px]
            bg-gradient-to-br
            from-green-500/10
            via-zinc-900
            to-zinc-900
            border
            border-green-500/30
            rounded-[28px]
            p-7
            md:p-8
            text-left
            hover:border-green-500
            hover:-translate-y-1
            hover:shadow-2xl
            transition-all
            duration-300
            flex
            flex-col
          "
        >

          <div className="flex items-start justify-between gap-4">

            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-green-500
                flex
                items-center
                justify-center
                text-xl
                text-black
                shrink-0
              "
            >
              💎
            </div>

            <span
              className="
                px-3
                py-1
                rounded-full
                bg-green-500/10
                border
                border-green-500/20
                text-green-400
                text-xs
                font-black
              "
            >
              PLANO
            </span>

          </div>

          <h2 className="text-xl font-black mt-5">
            Meu Plano
          </h2>

          <p className="text-zinc-400 mt-2 leading-relaxed">
            Veja seu plano, taxas, comissões, recebimentos,
            saldo e informações sobre saques.
          </p>

          <div className="mt-auto pt-6 text-green-400 font-bold text-sm">
            Ver plano e taxas →
          </div>

        </button>

        {/* SAIR */}
        <button
          onClick={() => router.push("/auth/logout")}
          className="
            group
            w-full
            h-full
            min-h-[250px]
            bg-zinc-900
            border
            border-red-900/70
            rounded-[28px]
            p-7
            md:p-8
            text-left
            hover:border-red-500
            hover:-translate-y-1
            hover:shadow-2xl
            transition-all
            duration-300
            flex
            flex-col
          "
        >

          <div
            className="
              w-12
              h-12
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
              transition
            "
          >
            🚪
          </div>

          <h2 className="text-xl font-black text-red-400">
            Sair da Conta
          </h2>

          <p className="text-zinc-400 mt-2 leading-relaxed">
            Encerre sua sessão com segurança neste dispositivo.
          </p>

          <div className="mt-auto pt-6 text-red-400 font-bold text-sm">
            Encerrar sessão →
          </div>

        </button>

      </div>

      {/* RODAPÉ INFORMATIVO */}
      <div
        className="
          w-full
          mt-8
          bg-zinc-900/60
          border
          border-zinc-800
          rounded-[28px]
          p-6
          md:p-7
        "
      >

        <div className="flex items-start gap-4">

          <div className="text-2xl">
            💡
          </div>

          <div>

            <h3 className="font-bold text-white">
              Tudo em um só lugar
            </h3>

            <p className="text-zinc-500 text-sm mt-1 leading-relaxed">
              Use esta área para acessar rapidamente seu perfil,
              configurações da conta e informações financeiras
              do seu plano Uranova.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}