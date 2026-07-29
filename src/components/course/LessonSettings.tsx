"use client";

import { useEffect, useState } from "react";

interface LessonSettingsProps {
  lessonId: string;
  isFree?: boolean;
  durationMinutes?: number;
  onUpdated?: () => void;
}

export default function LessonSettings({
  lessonId,
  isFree,
  durationMinutes,
  onUpdated,
}: LessonSettingsProps) {
  const [free, setFree] = useState(isFree ?? false);
  const [duration, setDuration] = useState(durationMinutes ?? 0);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFree(isFree ?? false);
    setDuration(durationMinutes ?? 0);
  }, [isFree, durationMinutes]);

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
          is_free: free,
          duration_minutes: duration,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar configurações.");
      }

      onUpdated?.();

      alert("Configurações salvas com sucesso.");
    } catch (error) {
      console.error(error);

      alert("Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={free}
          onChange={(e) => setFree(e.target.checked)}
        />

        <span>Aula gratuita</span>
      </label>

      <div>
        <label className="block text-sm mb-2">
          Duração (minutos)
        </label>

        <input
          type="number"
          min={0}
          value={duration}
          onChange={(e) =>
            setDuration(Number(e.target.value))
          }
          className="
            w-full
            rounded-xl
            bg-zinc-800
            p-4
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
          : "💾 Salvar Configurações"}
      </button>

    </div>
  );
}