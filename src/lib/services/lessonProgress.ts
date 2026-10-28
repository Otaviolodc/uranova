import { admin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireFinanceOwner } from "@/lib/finance/access";
import { requireCourseAccess } from "@/lib/security/course-access";
import { uuid } from "@/lib/security/validation";

export async function getCompletedLessons(userId: string) {
  await requireFinanceOwner(userId);
  const { data, error } = await admin
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).map((item) => item.lesson_id);
}

export async function completeLesson(
  userId: string,
  lessonId: string
) {
  await requireFinanceOwner(userId); uuid(lessonId);
  const client=await createClient();
  // RLS permits only the producer or a buyer with active, unexpired access.
  const {data:lesson,error:accessError}=await client.from("course_lessons").select("id,module_id").eq("id",lessonId).single();
  if(accessError||!lesson)throw new Error("FORBIDDEN");
  const {data:module,error:moduleError}=await client.from("course_modules").select("course_id").eq("id",lesson.module_id).single();
  if(moduleError||!module)throw new Error("FORBIDDEN");
  await requireCourseAccess(userId,module.course_id);
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
