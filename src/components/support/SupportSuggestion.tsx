"use client";

import { createSuggestion } from "@/lib/services/support";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface SupportSuggestionProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function SupportSuggestion({
  onBack,
  onSuccess,
}: SupportSuggestionProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      await createSuggestion(
        title.trim(),
        description.trim()
      );

      setTitle("");
      setDescription("");

      onSuccess();
    } catch (error) {
      console.error(error);

      alert("Não foi possível enviar sua sugestão.");
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
        Enviar sugestão
      </h3>

      <p className="mt-2 text-sm text-zinc-400">
        Tem uma ideia para melhorar a Uranova? Conte para nossa equipe.
      </p>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        placeholder="Título da sugestão"
        className="
          mt-6
          w-full
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

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
        placeholder="Conte sua ideia"
        className="
          mt-4
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
          disabled:opacity-50
        "
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
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
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading ? "Enviando..." : "Enviar sugestão"}
      </button>

    </div>
  );
}