import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();

  const authResponse = await supabase.auth.getUser();

console.log(
  "AUTH RESPONSE PROFILE:",
  JSON.stringify(authResponse, null, 2)
);

const user = authResponse.data.user;

  if (!user) {
    redirect("/auth/login");
  }

  const {
    data: profile,
    error,
  } = await supabase
    .from("profiles")
    .select(`
      name,
      username,
      avatar_url,
      phone,
      city,
      state,
      address,
      is_pro,
      created_at
    `)
    .eq("id", user.id)
    .single();

  console.log("PROFILE:", profile);
  console.log("PROFILE ERROR:", error);

  if (!profile) {
    return (
      <div className="text-zinc-400">
        Perfil não encontrado
      </div>
    );
  }

  return (
    <div>
      TESTE PROFILE
    </div>
  );
}