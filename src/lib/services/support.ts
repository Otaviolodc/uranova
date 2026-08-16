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

export async function createBug(
  title: string,
  description: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase
    .from("support_bugs")
    .insert({
      user_id: user.id,
      title,
      description,
    });

  if (error) {
    throw error;
  }

  return true;
}

export async function createSuggestion(
  title: string,
  description: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase
    .from("support_suggestions")
    .insert({
      user_id: user.id,
      title,
      description,
    });

  if (error) {
    throw error;
  }

  return true;
}

export async function createMessage(
  message: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase
    .from("support_messages")
    .insert({
      user_id: user.id,
      message,
    });

  if (error) {
    throw error;
  }

  return true;
}