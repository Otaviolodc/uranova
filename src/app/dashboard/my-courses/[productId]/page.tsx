import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function CoursePlayerPage({
  params,
}: PageProps) {
  const { productId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: access } = await supabase
  .from("customer_products")
  .select("product_id")
  .eq("customer_id", user.id)
  .eq("product_id", productId)
  .eq("status", "active")
  .maybeSingle();

if (!access) {
  notFound();
}

const { data: product } = await supabase
  .from("products")
  .select("id,title,user_id")
  .eq("id", productId)
  .single();

if (!product) {
  notFound();
}

  // ✅ Corrigido: course_id
  const { data: modules } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", product.id)
    .order("position");

  // Vamos melhorar esta consulta na próxima etapa
  const moduleIds = modules?.map((module) => module.id) ?? [];

  const { data: lessons } =
    moduleIds.length === 0
      ? { data: [] }
      : await supabase
          .from("course_lessons")
          .select("*")
          .in("module_id", moduleIds)
          .order("position");

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        {product.title}
      </h1>

      {modules?.map((module) => (
        <div
          key={module.id}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">
            📚 {module.title}
          </h2>

          <div className="space-y-2">
            {lessons
              ?.filter(
                (lesson) =>
                  lesson.module_id === module.id
              )
              .map((lesson) => (
                <button
                  key={lesson.id}
                  className="
                    w-full
                    rounded-xl
                    bg-zinc-900
                    hover:bg-zinc-800
                    transition
                    p-4
                    text-left
                  "
                >
                  <div className="font-medium">
                    ▶ {lesson.title}
                  </div>

                  {lesson.duration_minutes && (
                    <p className="text-sm text-zinc-400 mt-1">
                      {lesson.duration_minutes} min
                    </p>
                  )}
               </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}