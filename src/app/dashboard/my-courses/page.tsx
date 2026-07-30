import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function MyCoursesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const {
    data: customerProducts,
    error: customerProductsError,
  } = await supabase
    .from("customer_products")
    .select("product_id")
    .eq("customer_id", user.id)
    .eq("status", "active");

  console.log("USER:", user.id);
  console.log("CUSTOMER PRODUCTS:", customerProducts);
  console.log("CUSTOMER PRODUCTS ERROR:", customerProductsError);

  const productIds =
    customerProducts?.map(
      (item) => item.product_id
    ) ?? [];

  console.log("PRODUCT IDS:", productIds);

  const {
    data: products,
    error: productsError,
  } =
    productIds.length === 0
      ? {
          data: [],
          error: null,
        }
      : await supabase
          .from("products")
          .select("id,title")
          .in("id", productIds);

  console.log("PRODUCTS:", products);
  console.log("PRODUCTS ERROR:", productsError);

  return (
    <div className="max-w-6xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-2">
        Meus Cursos
      </h1>

      <p className="text-zinc-400 mb-8">
        Todos os cursos liberados para sua conta.
      </p>

      {products?.length === 0 && (
        <div
          className="
            rounded-2xl
            bg-zinc-900
            p-8
            text-center
            text-zinc-400
          "
        >
          Você ainda não possui cursos.
        </div>
      )}

      <div className="grid gap-6">

        {products?.map((product) => (

          <div
            key={product.id}
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-900
              p-6
            "
          >
            <h2 className="text-xl font-bold">
              {product.title}
            </h2>

            <Link
              href={`/dashboard/my-courses/${product.id}`}
              className="
                inline-flex
                mt-6
                rounded-xl
                bg-blue-600
                hover:bg-blue-500
                px-5
                py-3
                font-semibold
              "
            >
              ▶ Continuar Curso
            </Link>

          </div>

        ))}

      </div>

    </div>
  );
}