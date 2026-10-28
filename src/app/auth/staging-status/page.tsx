import { notFound, redirect } from "next/navigation";
import { authStagingEnabled } from "@/lib/security/staging-policy";
import { createClient } from "@/lib/supabase/server";

export default async function StagingStatus() {
  if (!authStagingEnabled()) notFound();
  const client = await createClient();
  const {data:{user},error} = await client.auth.getUser();
  if (error || !user) redirect("/auth/login");
  return <main className="p-8">
    <h1>Sessão autenticada no staging</h1>
    <p>Confirmação de sessão concluída. Integrações financeiras e AI estão indisponíveis.</p>
    <form action="/auth/logout" method="get">
      <button type="submit">Encerrar sessão de teste</button>
    </form>
  </main>;
}
