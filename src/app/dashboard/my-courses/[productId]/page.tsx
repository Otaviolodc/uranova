import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CoursePlayer from "@/components/course/CoursePlayer";

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

console.log("PARAM PRODUCT ID:", productId);
console.log("PRODUCT:", product);

if (!product) {
  notFound();
}
  console.log("COURSE ID USED:", product.id);

  const {
  data: modules,
  error: modulesError,
} = await supabase
  .from("course_modules")
  .select("*")
  .eq("course_id", product.id)
  .order("position");

console.log("MODULES:", modules);
console.log("MODULES ERROR:", modulesError);

const moduleIds = modules?.map((module) => module.id) ?? [];

const {
  data: lessons,
  error: lessonsError,
} =
  moduleIds.length === 0
    ? {
        data: [],
        error: null,
      }
    : await supabase
        .from("course_lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("position");

console.log("LESSONS:", lessons);
console.log("LESSONS ERROR:", lessonsError);

  return (
  <CoursePlayer
    product={product}
    modules={modules ?? []}
    lessons={lessons ?? []}
  />
);
}