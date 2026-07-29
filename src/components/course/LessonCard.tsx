"use client";

import { useEffect, useState } from "react";

import LessonSection from "./LessonSection";
import LessonVideo from "./LessonVideo";
import LessonContent from "./LessonContent";
import LessonSettings from "./LessonSettings";

interface Lesson {
  id: string;
  title: string;
  description: string;
  position: number;

  video_provider: string | null;
  video_url: string | null;

  content: string | null;

  duration_minutes: number;

  is_free: boolean;
}

interface LessonCardProps {
  lesson: Lesson;
  onUpdated: () => void;
}

export default function LessonCard({
  lesson,
  onUpdated,
}: LessonCardProps) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(
    lesson.description ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setTitle(lesson.title);
    setDescription(lesson.description ?? "");
  }, [lesson]);

  async function handleSave() {
    try {
      setSaving(true);

      const response = await fetch("/api/course-lessons", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: lesson.id,
          title,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar aula.");
      }

      onUpdated();
    } catch (error) {
      console.error(error);
      alert("Não foi possível salvar a aula.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta aula?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/course-lessons?id=${lesson.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir aula.");
      }

      onUpdated();
    } catch (error) {
      console.error(error);
      alert("Não foi possível excluir a aula.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        overflow-hidden
      "
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          w-full
          flex
          items-center
          justify-between
          p-5
          hover:bg-zinc-800
          transition-colors
        "
      >
        <div className="text-left">
          <h3 className="font-bold text-lg">
            🎥 {lesson.title}
          </h3>

          {lesson.description && (
            <p className="text-zinc-400 text-sm mt-1">
              {lesson.description}
            </p>
          )}
        </div>

        <span
          className={`
            text-xl
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="border-t border-zinc-800 p-6 space-y-6">
          <div>
            <label className="block text-sm mb-2">
              Título
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
                w-full
                rounded-xl
                bg-zinc-800
                p-4
              "
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              Descrição
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="
                w-full
                rounded-xl
                bg-zinc-800
                p-4
              "
            />
          </div>

          <LessonSection
            icon="🎥"
            title="Vídeo"
          >
            <LessonVideo
              lessonId={lesson.id}
              videoProvider={lesson.video_provider}
              videoUrl={lesson.video_url}
              onUpdated={onUpdated}
          />
          </LessonSection>

          <LessonSection
            icon="📝"
            title="Conteúdo"
          >
           <LessonContent
             lessonId={lesson.id}
             content={lesson.content}
             onUpdated={onUpdated}
            />
          </LessonSection>

          <LessonSection
            icon="📎"
            title="Materiais"
          >
            <p className="text-zinc-400">
              Em desenvolvimento.
            </p>
          </LessonSection>

          <LessonSection
            icon="⚙️"
            title="Configurações"
          >
            <LessonSettings
              lessonId={lesson.id}
              isFree={lesson.is_free}
              durationMinutes={lesson.duration_minutes}
              onUpdated={onUpdated}
            />
          </LessonSection>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="
                bg-green-500
                hover:bg-green-400
                disabled:opacity-60
                disabled:cursor-not-allowed
                text-black
                px-6
                py-3
                rounded-xl
                font-bold
              "
            >
              {saving
                ? "Salvando..."
                : "💾 Salvar Alterações"}
            </button>

            <button
              onClick={handleDelete}
              disabled={saving || deleting}
              className="
                bg-red-500
                hover:bg-red-400
                disabled:opacity-60
                disabled:cursor-not-allowed
                text-black
                px-6
                py-3
                rounded-xl
                font-bold
              "
            >
              {deleting
                ? "Excluindo..."
                : "🗑 Excluir Aula"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}