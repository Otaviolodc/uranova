import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isCourse } from "@/lib/courses";
import { activeAccess } from "@/lib/security/validation";

export default async function MyCoursesPage() {
  let courses: { id: string; title: string; type: string | null }[] = [];
  let message = "";
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("SESSION_REQUIRED");
    const { data: accesses, error } = await supabase.from("customer_products").select("product_id,status,expires_at").eq("customer_id", user.id).eq("status", "active");
    if (error) throw error;
    const ids = [...new Set((accesses ?? []).filter(access => activeAccess(access)).map(access => access.product_id))];
    const result = ids.length ? await supabase.from("products").select("id,title,type").in("id", ids).order("title").order("id") : { data: [], error: null };
    if (result.error) throw result.error;
    courses = (result.data ?? []).filter(product => isCourse(product.type));
  } catch (error) { message = error instanceof Error && error.message === "SESSION_REQUIRED" ? "Entre na sua conta para consultar seus cursos." : "Não foi possível carregar seus cursos. Atualize a página para tentar novamente."; }
  if (message) return <p role="alert" className="p-8">{message}</p>;
    return <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">Meus Cursos</h1>
      <p className="text-zinc-400 mb-8">Cursos disponíveis para sua conta.</p>
      {!courses.length && <p className="rounded-2xl bg-zinc-900 p-8">Você ainda não possui cursos disponíveis.</p>}
      <div className="grid gap-6">{courses.map(course => <article key={course.id} className="rounded-2xl border border-zinc-800 p-6">
        <h2 className="text-xl font-bold break-words">{course.title}</h2>
        <Link className="inline-flex mt-6 rounded-xl bg-blue-600 px-5 py-3" href={`/dashboard/my-courses/${course.id}`}>Continuar curso</Link>
      </article>)}</div>
    </div>;
}
