import { supabase } from "@/lib/supabase/client";

export async function createFeedback(
  rating: number,
  comment: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase
    .from("support_feedback")
    .insert({
      user_id: user.id,
      rating,
      comment,
    });

  if (error) {
    throw error;
  }

  return true;
}