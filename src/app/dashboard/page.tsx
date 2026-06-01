import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();

export default function Dashboard() {
  redirect("/dashboard/links");
}