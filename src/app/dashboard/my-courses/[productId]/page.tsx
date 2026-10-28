import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoursePlayer from "@/components/course/CoursePlayer";
import { getCompletedLessons } from "@/lib/services/lessonProgress";
import { activeAccess } from "@/lib/security/validation";
import { isCourse } from "@/lib/courses";

export default async function CoursePlayerPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) return <p role="alert">Não foi possível verificar sua sessão.</p>;
  if (!user) notFound();
  const { data: accesses, error: accessError } = await supabase.from("customer_products").select("status,expires_at").eq("customer_id", user.id).eq("product_id", productId).eq("status", "active");
  if (accessError) return <p role="alert">Não foi possível verificar seu acesso. Tente novamente.</p>;
  if (!accesses?.some(access => activeAccess(access))) notFound();
  const { data: product, error: productError } = await supabase.from("products").select("id,title,user_id,type").eq("id", productId).single();
  if (productError) return <p role="alert">Não foi possível carregar o curso.</p>;
  if (!product || !isCourse(product.type)) notFound();
  const { data: modules, error: modulesError } = await supabase.from("course_modules").select("*").eq("course_id", product.id).order("position").order("id");
  if (modulesError) return <p role="alert">Não foi possível carregar os módulos.</p>;
  const ids = (modules ?? []).map(module => module.id);
  const { data: lessons, error: lessonsError } = ids.length ? await supabase.from("course_lessons").select("*").in("module_id", ids).order("position").order("id") : { data: [], error: null };
  if (lessonsError) return <p role="alert">Não foi possível carregar as aulas.</p>;
  let completed: string[];
  try { completed = await getCompletedLessons(user.id); }
  catch { return <p role="alert">Não foi possível carregar seu progresso. Atualize a página para tentar novamente.</p>; }
    return <CoursePlayer userId={user.id} product={product} modules={modules ?? []} lessons={lessons ?? []} completedLessons={completed} />;
}
