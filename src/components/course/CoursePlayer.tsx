"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
}

interface Lesson {
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

function getYoutubeEmbed(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    }

    if (parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }

    return url;
  } catch {
    return url;
  }
}

export default function CoursePlayer({
  userId,
  product,
  modules,
  lessons,
  completedLessons,
}: Props) {
  const firstLesson = lessons[0] ?? null;

  const [selectedLesson, setSelectedLesson] =
    useState(firstLesson);

  const [completed, setCompleted] =
    useState(completedLessons);

  const playerTopRef = useRef<HTMLDivElement>(null);

  const orderedLessons = useMemo(() => lessons, [lessons]);

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

  const videoUrl = useMemo(() => {
    if (!selectedLesson?.video_url) return null;

    if (selectedLesson.video_provider === "youtube") {
      return getYoutubeEmbed(selectedLesson.video_url);
    }

    return selectedLesson.video_url;
  }, [selectedLesson]);

  async function handleCompleteLesson() {
  if (!selectedLesson) return;

  try {
    const response = await fetch(
      "/api/course/complete-lesson",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: selectedLesson.id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error();
    }

    if (!completed.includes(selectedLesson.id)) {
      setCompleted([
        ...completed,
        selectedLesson.id,
      ]);
    }
  } catch {
    alert("Erro ao concluir a aula.");
  }
}

  return (
    <div className="max-w-7xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        {product.title}
      </h1>

      <div className="grid lg:grid-cols-[340px_1fr] gap-8">

        <aside
          className="
            rounded-2xl
            bg-zinc-900
            p-5
            space-y-6
          "
        >
          {modules.map((module) => (
            <div key={module.id}>

              <h2 className="font-bold mb-3">
                📚 {module.title}
              </h2>

              <div className="space-y-2">

                {lessons
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

        <main ref={playerTopRef}>

          <div
            className="
              rounded-2xl
              overflow-hidden
              bg-black
              aspect-video
            "
          >
            {videoUrl ? (
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
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
    p-8
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
    whitespace-pre-wrap
    leading-8
    text-zinc-300
  "
>
  {selectedLesson.content.replace(/^"|"$/g, "")}
</div>

</div>
)}

<div className="mt-10">
  <button
    onClick={handleCompleteLesson}
    disabled={
      !!selectedLesson &&
      completed.includes(selectedLesson.id)
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

<div className="mt-10 flex items-center justify-between border-t border-zinc-800 pt-6">

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