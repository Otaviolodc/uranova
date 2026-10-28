import CertificateDownload from "@/components/course/CertificateDownload";
import { isCourse } from "@/lib/courses";
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
    .select("id,title,type")
    .eq("id", productId)
    .single();

  if (!product || !isCourse(product.type)) {
    notFound();
  }

  let completion;
  try { completion = await getCourseCompletion(user.id, product.id); }
  catch { return <p role="alert">Certificado indisponível. Verifique seu acesso e tente novamente.</p>; }

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

            <CertificateDownload productId={product.id} />

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