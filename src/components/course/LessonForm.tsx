"use client";

import { useState } from "react";

interface LessonFormProps {
  moduleId: string;
  onCreated: () => void;
}

export default function LessonForm({
  moduleId,
  onCreated,
}: LessonFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function createLesson() {
    if (!title.trim()) return;

    setLoading(true);

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
          position: 0,
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