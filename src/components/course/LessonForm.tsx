"use client";

import { useRef, useState } from "react";

interface LessonFormProps {
  moduleId: string;
  position: number;
  onCreated: () => void;
}

export default function LessonForm({
  moduleId,
  position,
  onCreated,
}: LessonFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);

  async function createLesson() {
    if (!title.trim() || busy.current) return;
    busy.current = true;

    setLoading(true);

    try {
    const response = await fetch(
      "/api/course-lessons",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          moduleId,
          title,
          description,
          position,
          videoUrl: "",
        }),
      }
    );

    setLoading(false);

    if (!response.ok) {
      alert("Erro ao criar aula.");
      return;
    }

    setTitle("");
    setDescription("");

    onCreated();
    } catch { alert("Falha ao salvar aula. Confira a lista antes de tentar novamente."); }
    finally { busy.current = false; setLoading(false); }
  }

  return (
    <div
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        p-5
        space-y-4
      "
    >
      <input
        aria-label="Título da aula"
        maxLength={200}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da aula"
        className="
          w-full
          rounded-xl
          bg-zinc-800
          p-4
        "
      />

      <textarea
        aria-label="Descrição da aula"
        maxLength={12000}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição da aula"
        rows={4}
        className="
          w-full
          rounded-xl
          bg-zinc-800
          p-4
          resize-none
        "
      />

      <button
        onClick={createLesson}
        disabled={loading}
        className="
          bg-green-500
          hover:bg-green-400
          disabled:opacity-50
          text-black
          font-bold
          px-5
          py-3
          rounded-xl
        "
      >
        {loading ? "Salvando..." : "Salvar Aula"}
      </button>
    </div>
  );
}
