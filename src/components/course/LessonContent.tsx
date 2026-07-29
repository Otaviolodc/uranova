"use client";

import { useEffect, useState } from "react";

interface LessonContentProps {
  lessonId: string;
  content?: string | null;
  onUpdated?: () => void;
}

export default function LessonContent({
  lessonId,
  content,
  onUpdated,
}: LessonContentProps) {
  const [text, setText] = useState(content ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(content ?? "");
  }, [content]);

  async function handleSave() {
    try {
      setSaving(true);

      const response = await fetch("/api/course-lessons", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: lessonId,
          content: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar conteúdo.");
      }

      onUpdated?.();

      alert("Conteúdo salvo com sucesso.");
    } catch (error) {
      console.error(error);

      alert("Não foi possível salvar o conteúdo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm mb-2">
          Conteúdo da aula
        </label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Digite o conteúdo desta aula..."
          className="
            w-full
            rounded-xl
            bg-zinc-800
            p-4
            resize-y
          "
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="
          bg-blue-500
          hover:bg-blue-400
          disabled:bg-zinc-700
          disabled:text-zinc-400
          disabled:cursor-not-allowed
          text-black
          font-bold
          px-6
          py-3
          rounded-xl
          transition-colors
        "
      >
        {saving
          ? "Salvando..."
          : "💾 Salvar Conteúdo"}
      </button>
    </div>
  );
}