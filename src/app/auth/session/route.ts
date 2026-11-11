import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const client = await createClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return Response.json({ userId: null }, { status: 401, headers });
    return Response.json({ userId: user.id }, { headers });
  } catch {
    return Response.json({ userId: null }, { status: 503, headers });
  }
}
