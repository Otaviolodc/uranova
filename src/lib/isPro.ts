import { supabase }
from "@/lib/supabase/client";

export async function isProUser() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data } =
    await supabase

      .from("profiles")

      .select("is_pro")

      .eq("id", user.id)

      .single();

  return data?.is_pro || false;

}