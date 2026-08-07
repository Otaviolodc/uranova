"use client";

import { CheckCircle2 } from "lucide-react";

interface SupportSuccessProps {
  onClose: () => void;
}

export default function SupportSuccess({
  onClose,
}: SupportSuccessProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center text-center">

      <CheckCircle2
        size={70}
        className="text-emerald-500 mb-5"
      />

      <h2 className="text-2xl font-bold text-white">
        Obrigado!
      </h2>

      <p className="mt-3 text-zinc-400">
        Sua avaliação foi enviada com sucesso.
      </p>

      <button
        onClick={onClose}
        className="
          mt-8

          w-full

          rounded-xl

          bg-emerald-600

          py-3

          font-semibold

          text-white

          transition

          hover:bg-emerald-500
        "
      >
        Fechar
      </button>

    </div>
  );
}