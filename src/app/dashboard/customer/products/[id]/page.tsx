"use client";

import ProductViewer from "@/components/customer/ProductViewer";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  title: string;
  description: string | null;
  image_url: string |null;
  file_path: string | null;
};

export default function CustomerProductPage() {
  const { id } = useParams();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [hasAccess, setHasAccess] =
    useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function openProduct() {
  if (!product?.file_path) return;

  const { data, error } =
    await supabase.storage
      .from("products")
      .createSignedUrl(
        product.file_path,
        60 * 30 // 30 minutos
      );

  if (error) {
    console.error(error);
    return;
  }

  window.open(data.signedUrl, "_blank");
}

  async function fetchProduct() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setLoading(false);
    return;
  }

  const { data: access, error: accessError } =
  await supabase
    .from("customer_products")
    .select("id")
    .eq("customer_id", user.id)
    .eq("product_id", id)
    .eq("status", "active")
    .maybeSingle();
  
  if (accessError) {
    console.error(accessError);
    setLoading(false);
    return;
  }

  if (!access) {
    setHasAccess(false);
    setLoading(false);
    return;
  }

  const { data, error } =
    await supabase
      .from("products")
      .select(`
        id,
        title,
        description,
        image_url,
        file_path
      `)
      .eq("id", id)
      .single();

  if (error) {
    console.error(error);
    setLoading(false);
    return;
  }

  setProduct(data);

  setLoading(false);

}
  
  if (loading) {
  return (
    <div className="p-10">
      Carregando produto...
    </div>
  );
}

if (!product) {
  return (
    <div className="p-10">
      Produto não encontrado.
    </div>
  );
}

  if (!hasAccess) {
  return (
    <div className="max-w-3xl mx-auto py-16">

      <div
        className="
          bg-zinc-900
          border
          border-red-500/30
          rounded-3xl
          p-10
          text-center
        "
      >

        <div className="text-6xl mb-6">
          🔒
        </div>

        <h1 className="text-4xl font-black">
          Acesso Negado
        </h1>

        <p className="text-zinc-400 mt-4">
          Você ainda não possui acesso
          a este produto.
        </p>

        <a
          href="/dashboard/marketplace"
          className="
            inline-block
            mt-8
            bg-green-500
            hover:bg-green-400
            text-black
            font-bold
            px-8
            py-4
            rounded-2xl
          "
        >
          Ir para Marketplace
        </a>

      </div>

    </div>
  );
}

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-black">
          📦 Produto
        </h1>

        <p className="text-zinc-400 mt-2">
          Área exclusiva do produto adquirido.
        </p>

      </div>

      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          overflow-hidden
        "
      >

        <img
          src={
            product.image_url ||
            "/placeholder.png"
        }
        alt={product.title}
        className="
          w-full
          h-72
          object-cover
        "
        />

        <div className="p-8">
         
          <h1
            className="
              text-4xl
              font-black
              mt-6
            "
          >
            {product.title}
          </h1>
 
          <p
            className="
              text-zinc-400
              mt-6
              leading-8
            "
          >
            {product.description}
          </p>

          <div
            className="
              mt-10
              grid
              md:grid-cols-3
              gap-5
            "
          >

            <div
              className="
                bg-zinc-800
                rounded-2xl
                p-5
              "
            >
              <p className="text-zinc-500 text-sm">
                Produto
              </p>

              <h3 className="text-xl font-bold mt-2">
                Digital
              </h3>
            </div>

            <div
              className="
                bg-zinc-800
                rounded-2xl
                p-5
              "
            >
              <p className="text-zinc-500 text-sm">
                Status
              </p>

              <h3 className="text-xl font-bold mt-2 text-green-400">
                Liberado
              </h3>
            </div>

            <div
              className="
                bg-zinc-800
                rounded-2xl
                p-5
              "
            >
              <p className="text-zinc-500 text-sm">
                Conteúdo
              </p>

              <h3 className="text-xl font-bold mt-2">
                1 Arquivo
              </h3>
            </div>

          </div>

          {product.file_path ? (

            <div
              className="
                mt-10
                bg-zinc-800
                rounded-2xl
                border
                border-zinc-700
                p-6
                flex
                items-center
                justify-between
                gap-6
              "
            >

              <div>

                <p className="text-zinc-500 text-sm">
                  Arquivo Principal
                </p>

                <h3 className="text-xl font-bold mt-2">
                  {product.title}
                </h3>

                <p className="text-green-400 mt-2">
                  Conteúdo disponível
                </p>

              </div>

              <button
                onClick={openProduct}
                className="
                  bg-green-500
                  hover:bg-green-400
                  text-black
                  font-bold
                  px-8
                  py-4
                  rounded-2xl
                "
              >
                Abrir
              </button>

            </div>

          ) : (

            <div
              className="
                mt-10
                rounded-2xl
                border
                border-yellow-500/30
                bg-yellow-500/10
                p-6
              "
            >

              Este produto ainda não possui conteúdo disponível.

            </div>

          )}

          {/* ProductViewer será implementado na próxima sprint */}

        </div>

      </div>

    </div>

  );
}