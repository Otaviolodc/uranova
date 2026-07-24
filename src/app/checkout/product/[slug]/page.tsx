"use client";

import { supabase } from "@/lib/supabase/client";;
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductPage() {

const params = useParams();

const slug = Array.isArray(params.slug)
  ? params.slug[0]
  : params.slug;

const decodedSlug = slug
  ? decodeURIComponent(slug)
  : "";

const [product, setProduct] =
  useState<any>(null);

const [loading, setLoading] =
  useState(true);

const [relatedProducts, setRelatedProducts] =
  useState<any[]>([]);

const fetchProduct = async () => {
  try {
    const { data, error } = await supabase
      .from("products_checkout")
      .select("*")
      .eq("checkout_slug", decodedSlug)
      .maybeSingle();

console.log("Slug recebido:", slug);
console.log("Slug decodificado:", decodedSlug);
console.log("Produto encontrado:", data);
console.log("Erro:", error);

    if (error) {
      console.error(error);
    }

    if (!data) {
      setLoading(false);
      return;
    }

    setProduct(data);

    await supabase
      .from("analytics")
      .insert({
        user_id: data.user_id,
        product_id: data.id,
        event_type: "product_view",
        page: "product",
      });

    const { data: related } = await supabase
      .from("products_checkout")
      .select("*")
      .neq("id", data.id)
      .limit(4);

    setRelatedProducts(related || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}; 

useEffect(() => {
  if (slug) {
    fetchProduct();
  }
}, [slug]);
  
  if (loading) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Carregando produto...
    </div>
  );
}

if (!product) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Produto não encontrado.
    </div>
  );
}

  return (

    <div className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">

          {/* IMAGEM */}
          <div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

              {product.image_url ? (

                <img
                  src={product.image_url}
                  className="
                    w-full
                    h-[650px]
                    object-cover
                  "
                />

              ) : (

                <div
                  className="
                    h-[650px]
                    flex
                    items-center
                    justify-center
                    text-8xl
                  "
                >
                  📦
                </div>

              )}

            </div>

          </div>

          {/* INFO */}
          <div>

            <div className="flex gap-3 mb-6">

  <span
    className="
      bg-green-500/10
      text-green-400
      px-4
      py-2
      rounded-full
      font-bold
    "
  >
    Produto Digital
  </span>

  <span
    className="
      bg-blue-500/10
      text-blue-400
      px-4
      py-2
      rounded-full
      font-bold
    "
  >
    {product.type}
  </span>

</div>

            {/* TÍTULO */}
            <h1 className="text-6xl font-black leading-tight">

              {product.title}

            </h1>

            {/* DESCRIÇÃO */}
            <p className="text-gray-400 text-xl mt-8 leading-relaxed">

              {product.description ||
                "Produto digital disponível no marketplace Uranova."}

            </p>

            {/* PREÇO */}
            <div className="mt-10">

              <p className="text-gray-500 text-lg">

                Preço

              </p>

              <h2 className="text-7xl font-black text-green-400 mt-2">

                R$ {product.price}

              </h2>

            </div>

            {/* IA */}
            <div
              className="
                bg-zinc-900
                border
                border-zinc-800
                rounded-2xl
                p-5
                mt-8
              "
            >

              <h3 className="font-bold text-white mb-3">
                Informações do Produto
              </h3>

              <ul className="space-y-2 text-zinc-400">

                <li>
                  ✓ Produto Digital
                </li>

                <li>
                  ✓ Acesso Imediato
                </li>

                <li>
                  ✓ Pagamento Seguro
                </li>

                </ul>

            </div>

            {/* BOTÃO COMPRAR */}

    <a
      href={`/checkout/${product.checkout_slug}`}
      className="
        mt-10
        block
        w-full
        bg-gradient-to-r
        from-green-500
        to-emerald-400
        hover:scale-[1.02]
        transition-all
        text-black
        text-center
        py-5
        rounded-2xl
        font-black
        text-xl
      "
    >
      Comprar Agora
    </a>

    <p
      className="
        text-center
        text-zinc-500
        text-sm
        mt-3
      "
    >
      Pagamento seguro • Liberação imediata
    </p>

<div className="flex gap-3 mt-4">

  <button
    onClick={() => {
      navigator.clipboard.writeText(
        window.location.href
      );

      alert("Link copiado!");
    }}
    className="
      flex-1
      bg-zinc-800
      hover:bg-zinc-700
      py-3
      rounded-xl
      font-semibold
    "
  >
    Copiar Link
  </button>

  <a
    href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
    target="_blank"
    className="
      flex-1
      bg-green-600
      hover:bg-green-500
      py-3
      rounded-xl
      text-center
      font-semibold
    "
  >
    WhatsApp
  </a>

</div>

            {/* INFO PRODUTO */}
            <div className="grid grid-cols-3 gap-4 mt-10">

             <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">

              <p className="text-zinc-400 text-sm">
                Tipo
              </p>

              <h2 className="text-xl font-bold mt-2">
                {product.type}
              </h2>

            </div>

            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">

              <p className="text-zinc-400 text-sm">
                Status
              </p>

              <h2 className="text-xl font-bold mt-2 text-green-400">
                {product.status}
              </h2>

            </div>

            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">

              <p className="text-zinc-400 text-sm">
                Marketplace
              </p>

              <h2 className="text-xl font-bold mt-2">
                {product.is_marketplace
                  ? "Sim"
                  : "Não"}
              </h2>

            </div>

          </div>

        </div>

      </div>

        {/* RELACIONADOS */}
        <div className="mt-32">

          <div className="flex items-center justify-between mb-10">

            <div>

              <h2 className="text-5xl font-black">

                Você também pode gostar

              </h2>

              <p className="text-gray-400 mt-3 text-lg">

                Produtos recomendados pela IA

              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

            {relatedProducts.map((item) => (

              <a
                key={item.id}
                href={`/checkout/product/${item.checkout_slug}`}
                className="
                  bg-zinc-900
                  border
                  border-zinc-800
                  rounded-3xl
                  overflow-hidden
                  hover:border-green-500/30
                  hover:-translate-y-2
                  transition-all
                "
              >

                {item.image_url ? (

                  <img
                    src={item.image_url}
                    className="
                      w-full
                      h-60
                      object-cover
                    "
                  />

                ) : (

                  <div className="h-60 flex items-center justify-center text-5xl">

                    Produtos

                  </div>

                )}

                <div className="p-5">

                  <h3 className="text-xl font-bold line-clamp-2">

                    {item.title}

                  </h3>

                  <p className="text-green-400 text-3xl font-black mt-4">

                    R$ {item.price}

                  </p>

                </div>

              </a>

            ))}

          </div>

        </div>

      </div>

    </div>

  );

}