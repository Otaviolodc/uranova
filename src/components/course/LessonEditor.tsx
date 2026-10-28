"use client";

import { useEffect, useState, useCallback } from "react";

import { nextPosition, orderCourseItems } from "@/lib/courses";
import LessonForm from "./LessonForm";
import LessonCard from "./LessonCard";

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
interface LessonEditorProps {
  moduleId: string;
}

export default function LessonEditor({
  moduleId,
}: LessonEditorProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);
  const fetchLessons = useCallback(async () => {

    try {


    const response = await fetch(
      `/api/course-lessons?moduleId=${moduleId}`
    );

    if (response.ok) {
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error();
      setLessons(orderCourseItems(data));
      setError(false);
    } else throw new Error();

    } catch { setError(true); } finally { setLoading(false); }
  }, [moduleId]);

  useEffect(() => {
    if (moduleId) {
      // State updates in this loader follow the network response/error.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchLessons();
    }
  }, [moduleId, fetchLessons]);

  return (
    <div className="space-y-4">

      {!loading && !error && <LessonForm
        moduleId={moduleId}
        position={nextPosition(lessons)}
        onCreated={fetchLessons}
      />}

      {error ? <p role="alert">Erro ao carregar aulas. <button onClick={fetchLessons}>Tentar novamente</button></p> : loading ? (
        <p className="text-zinc-400">
          Carregando aulas...
        </p>
      ) : lessons.length === 0 ? (
        <div
          className="
            rounded-xl
            bg-zinc-900
            p-4
            text-zinc-400
          "
        >
          Nenhuma aula criada.
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onUpdated={fetchLessons}
            />
          ))}
        </div>
      )}

    </div>
  );
}
