"use client";

import { useEffect, useState } from "react";

interface LessonVideoProps {
  lessonId: string;
  videoProvider?: string | null;
  videoUrl?: string | null;
  onUpdated?: () => void;
}

export default function LessonVideo({
  lessonId,
  videoProvider,
  videoUrl,
  onUpdated,
}: LessonVideoProps) {
  const [provider, setProvider] = useState(
    videoProvider ?? "youtube"
  );

  const [url, setUrl] = useState(
    videoUrl ?? ""
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProvider(videoProvider ?? "youtube");
    setUrl(videoUrl ?? "");
  }, [videoProvider, videoUrl]);

  async function handleSave() {
    try {
      setSaving(true);

      const response = await fetch(
        "/api/course-lessons",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: lessonId,
            video_provider: provider,
            video_url: url,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao salvar vídeo.");
      }

      onUpdated?.();

      alert("Vídeo salvo com sucesso.");
    } catch (error) {
      console.error(error);

      alert("Não foi possível salvar o vídeo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">

      <div>
        <label className="block text-sm mb-2">
          Plataforma do vídeo
        </label>

        <select
          value={provider}
          onChange={(e) =>
            setProvider(e.target.value)
          }
          className="
            w-full
            rounded-xl
            bg-zinc-800
            p-4
          "
        >
          <option value="youtube">
            YouTube
          </option>

          <option value="vimeo">
            Vimeo
          </option>
        </select>
      </div>

      <div>
        <label className="block text-sm mb-2">
          Link do vídeo
        </label>

        <input
          type="url"
          value={url}
          onChange={(e) =>
            setUrl(e.target.value)
          }
          placeholder="https://..."
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
        disabled={saving || !url.trim()}
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
          : "💾 Salvar Vídeo"}
      </button>

    </div>
  );
}