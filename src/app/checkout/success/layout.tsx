import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrivateSession from "@/components/auth/PrivateSession";

export default async function SuccessLayout({ children }: { children: ReactNode }) {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/auth/login");
  return <PrivateSession userId={user.id}>{children}</PrivateSession>;
}
