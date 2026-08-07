"use client";

import { createFeedback } from "@/lib/services/support";
import { useState } from "react";
import {
  ArrowLeft,
  Frown,
  Meh,
  Smile,
  Laugh,
} from "lucide-react";

interface SupportFeedbackProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ratings = [
  {
    value: 1,
    label: "Muito ruim",
    color: "bg-red-500 hover:bg-red-400",
    icon: <Frown size={30} />,
  },
  {
    value: 2,
    label: "Ruim",
    color: "bg-orange-500 hover:bg-orange-400",
    icon: <Frown size={30} />,
  },
  {
    value: 3,
    label: "Regular",
    color: "bg-yellow-400 hover:bg-yellow-300 text-black",
    icon: <Meh size={30} />,
  },
  {
    value: 4,
    label: "Bom",
    color: "bg-lime-500 hover:bg-lime-400",
    icon: <Smile size={30} />,
  },
  {
    value: 5,
    label: "Excelente",
    color: "bg-emerald-500 hover:bg-emerald-400",
    icon: <Laugh size={30} />,
  },
];

export default function SupportFeedback({
  onBack,
  onSuccess,
}: SupportFeedbackProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  async function handleSubmit() {
  if (!rating) {
    alert("Escolha uma nota.");
    return;
  }

  try {
    await createFeedback(
      rating,
      comment
    );

    onSuccess();
  } catch (error) {
    console.error(error);

    alert("Não foi possível enviar sua avaliação.");
  }
}

  return (
    <div className="p-5">
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <h3 className="text-xl font-bold text-white">
        Como você avalia a Uranova?
      </h3>

      <p className="mt-2 text-sm text-zinc-400">
        Sua opinião nos ajuda a melhorar continuamente.
      </p>

      <div className="mt-6 grid grid-cols-5 gap-3">
        {ratings.map((item) => (
          <button
            key={item.value}
            onClick={() => setRating(item.value)}
            className={`
              h-14
              rounded-xl

              flex
              items-center
              justify-center

              transition-all
              duration-300

              ${item.color}

              ${
                rating === item.value
                  ? "scale-110 ring-2 ring-white"
                  : "opacity-70 hover:opacity-100"
              }
            `}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {rating && (
        <p className="mt-3 text-center text-sm text-emerald-400">
          {ratings.find((r) => r.value === rating)?.label}
        </p>
      )}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Conte um pouco mais sobre sua experiência (opcional)"
        className="
          mt-6
          h-32
          w-full

          resize-none

          rounded-xl

          border
          border-white/10

          bg-zinc-800

          p-4

          text-white

          placeholder:text-zinc-500

          focus:border-emerald-500
          focus:outline-none
        "
      />

      <button
        onClick={handleSubmit}
        className="
          mt-5

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
        Enviar avaliação
      </button>
    </div>
  );
}