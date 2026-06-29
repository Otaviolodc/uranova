import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const cookieStore = await cookies();

  console.log("COOKIES:");
  console.log(cookieStore.getAll());

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("SESSION:");
  console.log(session);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("USER:");
  console.log(user);

  return Response.json({
    success: true,
  });
}