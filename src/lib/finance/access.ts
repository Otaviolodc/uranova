import "server-only";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";

export async function requireFinanceUser() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireFinanceAdmin() {
  const user = await requireFinanceUser();
  const { data, error } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (error || data?.role !== "admin" || !process.env.OWNER_EMAIL || user.email !== process.env.OWNER_EMAIL) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireFinanceOwner(userId: string) {
  const user = await requireFinanceUser();
  if (user.id !== userId) throw new Error("FORBIDDEN");
  return user;
}
