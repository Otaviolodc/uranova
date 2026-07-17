import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      id,
      title,
      price,
      image_url,
      type,
      user_id,
      created_at
    `)
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>

        <h1 className="text-4xl font-bold">
          {product.title}
        </h1>

        <p className="text-zinc-400 mt-2">
          Detalhes do produto
        </p>

      </div>

      {/* CARD */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <h2 className="text-xl font-bold mb-6">
          Informações do produto
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <p className="text-zinc-500 text-sm">Nome</p>
            <p>{product.title}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Tipo</p>
            <p>{product.type || "-"}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Preço</p>
            <p>
              R$ {Number(product.price).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          <div>
            <p className="text-zinc-500 text-sm">Cadastro</p>
            <p>
              {product.created_at
                ? new Date(product.created_at).toLocaleDateString("pt-BR")
                : "-"}
            </p>
          </div>
         
        </div>

      </div>

    </div>
  );
}