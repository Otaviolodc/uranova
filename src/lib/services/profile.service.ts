import { createClient } from "@/lib/supabase/server";

import type { Profile } from "@/types/profile";

export async function getProfile(
  userId: string
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("getProfile:", error);
    return null;
  }

  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("updateProfile:", error);
    return false;
  }

  return true;
}