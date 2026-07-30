import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCourseCompletion } from "@/lib/services/certificate";

interface PageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function CertificatePage({
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

  const { data: product } = await supabase
    .from("products")
    .select("id,title")
    .eq("id", productId)
    .single();

  if (!product) {
    notFound();
  }

  const completion = await getCourseCompletion(
    user.id,
    product.id
  );

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">

      <h1 className="text-4xl font-bold mb-8">
        🎓 Certificado
      </h1>

      <div className="rounded-2xl bg-zinc-900 p-8">

        <h2 className="text-2xl font-semibold">
          {product.title}
        </h2>

        <p className="mt-6 text-zinc-400">
          Aulas concluídas:
          {" "}
          <strong>
            {completion.completedLessons}
          </strong>
          {" / "}
          <strong>
            {completion.totalLessons}
          </strong>
        </p>

        {completion.completed ? (
          <div className="mt-8">

            <div className="rounded-xl bg-green-600/20 border border-green-600 p-5">
              <h3 className="text-green-400 font-bold text-xl">
                ✅ Curso concluído
              </h3>

              <p className="mt-2 text-zinc-300">
                Seu certificado já pode ser emitido.
              </p>
            </div>

            <a
              href={`/api/course/certificate?productId=${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="
                mt-8
                block
                w-full
                rounded-xl
                bg-blue-600
                py-4
                text-center
                font-semibold
                hover:bg-blue-700
                transition
              "
            >
              🎓 Baixar Certificado
            </a>

          </div>
        ) : (
          <div className="mt-8 rounded-xl bg-yellow-500/10 border border-yellow-600 p-5">

            <h3 className="text-yellow-400 font-bold">
              Curso ainda não concluído
            </h3>

            <p className="mt-2 text-zinc-300">
              Conclua todas as aulas para liberar o certificado.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}