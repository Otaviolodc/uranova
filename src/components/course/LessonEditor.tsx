"use client";

import { useEffect, useState } from "react";

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

  async function fetchLessons() {
    setLoading(true);

    const response = await fetch(
      `/api/course-lessons?moduleId=${moduleId}`
    );

    if (response.ok) {
      const data = await response.json();
      setLessons(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (moduleId) {
      fetchLessons();
    }
  }, [moduleId]);

  return (
    <div className="space-y-4">

      <LessonForm
        moduleId={moduleId}
        onCreated={fetchLessons}
      />

      {loading ? (
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