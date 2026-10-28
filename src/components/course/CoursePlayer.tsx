"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { courseSequence, orderCourseItems, courseVideo } from "@/lib/courses";

interface Product {
  id: string;
  title: string;
}

interface Module {
  position?: number | null;
  id: string;
  title: string;
}

interface Lesson {
  position?: number | null;
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_provider: string | null;
  video_url: string | null;
  content: string | null;
  duration_minutes: number | null;
}

interface Props {
  userId: string;
  product: Product;
  modules: Module[];
  lessons: Lesson[];
  completedLessons: string[];
}

export default function CoursePlayer({
  product,
  modules,
  lessons,
  completedLessons,
}: Props) {
  const orderedModules = useMemo(() => orderCourseItems(modules), [modules]);
  const orderedLessons = useMemo(() => courseSequence(modules, lessons), [modules, lessons]);
  const firstLesson = orderedLessons[0] ?? null;
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const [selectedLesson, setSelectedLesson] =
    useState(firstLesson);

  const [completed, setCompleted] =
    useState(completedLessons);

  const playerTopRef = useRef<HTMLDivElement>(null);



  const currentIndex = orderedLessons.findIndex(
    (lesson) => lesson.id === selectedLesson?.id
  );

  const previousLesson =
    currentIndex > 0
      ? orderedLessons[currentIndex - 1]
      : null;

  const nextLesson =
    currentIndex < orderedLessons.length - 1
      ? orderedLessons[currentIndex + 1]
      : null;

  const video = courseVideo(selectedLesson?.video_url ?? null, selectedLesson?.video_provider ?? null);

  async function handleCompleteLesson() {
  if (!selectedLesson || savingRef.current) return;
  const lessonId = selectedLesson.id;
  savingRef.current = true; setSaving(true); setSaveError(false);

  try {
    const response = await fetch(
      "/api/course/complete-lesson",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error();
    }

    setCompleted(previous => previous.includes(lessonId) ? previous : [...previous, lessonId]);
  } catch {
    setSaveError(true);
  } finally {
    savingRef.current = false; setSaving(false);
  }
}

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">

      <h1 className="text-3xl font-bold mb-8">
        {product.title}
      </h1>

      {!orderedLessons.length && <p role="status">Este curso ainda não possui aulas disponíveis.</p>}
      <div className="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-8">

        <aside
          className="
            rounded-2xl
            bg-zinc-900
            p-5
            space-y-6
          "
        >
          {orderedModules.map((module) => (
            <div key={module.id}>

              <h2 className="font-bold mb-3">
                📚 {module.title}
              </h2>

              <div className="space-y-2">

                {orderedLessons
                  .filter(
                    (lesson) =>
                      lesson.module_id === module.id
                  )
                  .map((lesson) => (

                    <button
                      key={lesson.id}
                      onClick={() =>
                        setSelectedLesson(lesson)
                      }
                      className={`
                        w-full
                        rounded-xl
                        p-3
                        text-left
                        transition

                        ${
                          selectedLesson?.id === lesson.id
                            ? "bg-blue-600"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">

                        <span className="font-medium">
                          ▶ {lesson.title}
                        </span>

                        {completed.includes(lesson.id) && (
                          <span className="text-green-400 text-lg">
                            ✓
                          </span>
                        )}

                      </div>

                      {(lesson.duration_minutes ?? 0) > 0 && (
                        <p className="text-xs opacity-70 mt-1">
                          {lesson.duration_minutes} min
                        </p>
                      )}
                    </button>

                  ))}

              </div>

            </div>
          ))}
        </aside>

        <main className="min-w-0" ref={playerTopRef}>

          <div
            className="
              rounded-2xl
              overflow-hidden
              bg-black
              aspect-video
            "
          >
            {video?.kind === "embed" ? (
              <iframe
                src={video.url}
                title={selectedLesson?.title || "Aula"}
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full"
                allowFullScreen
              />
            ) : video?.kind === "video" ? <video key={video.url} src={video.url} controls className="w-full h-full" /> : video ? <a href={video.url} target="_blank" rel="noopener noreferrer" className="block p-6">Abrir material da aula</a> : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                Nenhum vídeo disponível.
              </div>
            )}

          </div>

          <div
  className="
    mt-6
    rounded-2xl
    bg-zinc-900
    p-4 sm:p-8
  "
>

  <h2 className="text-3xl font-bold">
    {selectedLesson?.title}
  </h2>

  <div className="flex flex-wrap gap-3 mt-4">

    {selectedLesson?.video_provider && (
      <span
        className="
          rounded-full
          bg-red-500/20
          text-red-400
          px-4
          py-1
          text-sm
          font-medium
        "
      >
        ▶ {selectedLesson.video_provider.toUpperCase()}
      </span>
    )}

    {(selectedLesson?.duration_minutes ?? 0) > 0 && (
      <span
        className="
          rounded-full
          bg-zinc-800
          px-4
          py-1
          text-sm
        "
      >
        ⏱ {selectedLesson.duration_minutes} minutos
      </span>
    )}

  </div>

  {selectedLesson?.description && (
    <p
      className="
        mt-6
        text-zinc-400
        leading-7
      "
    >
      {selectedLesson.description}
    </p>
  )}

  {selectedLesson?.content && (
    <div
      className="
        mt-8
        border-t
        border-zinc-800
        pt-8
      "
    >
      <h3 className="text-xl font-semibold mb-4">
        Conteúdo da Aula
      </h3>

    <div
  className="
    whitespace-pre-wrap [overflow-wrap:anywhere]
    leading-8
    text-zinc-300
  "
>
  {selectedLesson.content.replace(/^"|"$/g, "")}
</div>

</div>
)}

<div className="mt-10">
  {saveError && <p role="alert">Não foi possível salvar o progresso. Tente novamente.</p>}
  {saving && <p role="status">Salvando progresso...</p>}
  <button
    onClick={handleCompleteLesson}
    disabled={
      saving || !selectedLesson || completed.includes(selectedLesson.id)
    }
    className="
      w-full
      rounded-xl
      bg-green-600
      py-4
      font-semibold
      transition
      hover:bg-green-700
      disabled:cursor-not-allowed
      disabled:bg-green-900
      disabled:opacity-70
    "
  >
    {selectedLesson &&
    completed.includes(selectedLesson.id)
      ? "✓ Aula concluída"
      : "✓ Marcar como concluída"}
  </button>
</div>

<div className="mt-8">
  <Link
    href={`/dashboard/my-courses/${product.id}/certificate`}
    className="
      block
      w-full
      rounded-xl
      border
      border-blue-600
      py-4
      text-center
      font-semibold
      text-blue-400
      transition
      hover:bg-blue-600
      hover:text-white
    "
  >
    🎓 Ver Certificado
  </Link>
</div>

<div className="mt-10 flex flex-wrap gap-3 items-center justify-between border-t border-zinc-800 pt-6">

  <button
    disabled={!previousLesson}
    onClick={() => {
      if (!previousLesson) return;

      setSelectedLesson(previousLesson);

      playerTopRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }}
    className="
      rounded-xl
      border
      border-zinc-700
      px-5
      py-3
      transition
      hover:bg-zinc-800
      disabled:cursor-not-allowed
      disabled:opacity-40
    "
  >
    ← Aula Anterior
  </button>

  <button
    disabled={!nextLesson}
    onClick={() => {
      if (!nextLesson) return;

      setSelectedLesson(nextLesson);

      playerTopRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }}
    className="
      rounded-xl
      bg-blue-600
      px-5
      py-3
      font-medium
      transition
      hover:bg-blue-700
      disabled:cursor-not-allowed
      disabled:opacity-40
    "
  >
    Próxima Aula →
  </button>

</div>

</div>

        </main>

      </div>

    </div>
  );
}