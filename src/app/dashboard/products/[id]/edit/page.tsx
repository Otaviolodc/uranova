import { notFound } from "next/navigation";
import ModulesEditor from "@/components/course/ModulesEditor";
import { createClient } from "@/lib/supabase/server";
import { isCourse } from "@/lib/courses";

export default async function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await createClient();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError) return <p role="alert" className="p-8">Não foi possível verificar sua sessão.</p>;
  if (!user) notFound();
  const { data: product, error } = await client.from("products").select("id,type").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (error) return <p role="alert" className="p-8">Não foi possível carregar o editor. Tente novamente.</p>;
  if (!product || !isCourse(product.type)) notFound();
  return <div className="max-w-6xl mx-auto p-4 sm:p-8">
    <h1 className="text-3xl font-bold mb-2">Editor da Área de Membros</h1>
    <p className="text-zinc-400 mb-8">Organize módulos, aulas e materiais.</p>
    <ModulesEditor />
  </div>;
}
