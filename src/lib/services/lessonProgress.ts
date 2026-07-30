import { admin } from "@/lib/supabase/admin";

export async function getCompletedLessons(userId: string) {
  const { data, error } = await admin
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId);

  if (error) throw error;

  return data.map((item) => item.lesson_id);
}

export async function completeLesson(
  userId: string,
  lessonId: string
) {
  const { error } = await admin
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
      },
      {
        onConflict: "user_id,lesson_id",
      }
    );

  if (error) throw error;
}