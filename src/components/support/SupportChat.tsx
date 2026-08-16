"use client";

import { createMessage } from "@/lib/services/support";
import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

interface SupportChatProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function SupportChat({
  onBack,
  onSuccess,
}: SupportChatProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) {
      alert("Digite sua mensagem.");
      return;
    }

    try {
      setLoading(true);

      await createMessage(message.trim());

      setMessage("");

      onSuccess();
    } catch (error) {
      console.error(error);

      alert("Não foi possível enviar sua mensagem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5">

      <button
        onClick={onBack}
        disabled={loading}
        className="
          mb-5
          flex
          items-center
          gap-2
          text-sm
          text-zinc-400
          transition
          hover:text-white
          disabled:opacity-50
        "
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <h3 className="text-xl font-bold text-white">
        Conversar com suporte
      </h3>

      <p className="mt-2 text-sm text-zinc-400">
        Envie sua dúvida ou mensagem para nossa equipe.
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
        placeholder="Digite sua mensagem..."
        className="
          mt-6
          h-36
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
          disabled:opacity-50
        "
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="
          mt-5
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-emerald-600
          py-3
          font-semibold
          text-white
          transition
          hover:bg-emerald-500
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <Send size={18} />

        {loading ? "Enviando..." : "Enviar mensagem"}
      </button>

    </div>
  );
}