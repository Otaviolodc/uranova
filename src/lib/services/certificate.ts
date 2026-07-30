import { admin } from "@/lib/supabase/admin";

export interface CourseCompletion {
  completed: boolean;
  totalLessons: number;
  completedLessons: number;
}

export async function getCourseCompletion(
  userId: string,
  productId: string
): Promise<CourseCompletion> {
  const { data: modules, error: modulesError } = await admin
    .from("course_modules")
    .select("id")
    .eq("course_id", productId);

  if (modulesError) {
    throw modulesError;
  }

  const moduleIds = modules.map((module) => module.id);

  if (moduleIds.length === 0) {
    return {
      completed: false,
      totalLessons: 0,
      completedLessons: 0,
    };
  }

  const { data: lessons, error: lessonsError } = await admin
    .from("course_lessons")
    .select("id")
    .in("module_id", moduleIds);

  if (lessonsError) {
    throw lessonsError;
  }

  const lessonIds = lessons.map((lesson) => lesson.id);

  if (lessonIds.length === 0) {
    return {
      completed: false,
      totalLessons: 0,
      completedLessons: 0,
    };
  }

  const { data: progress, error: progressError } = await admin
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  if (progressError) {
    throw progressError;
  }

  const completedLessons = progress.length;
  const totalLessons = lessonIds.length;

  return {
    completed: completedLessons === totalLessons,
    completedLessons,
    totalLessons,
  };
}