"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  title: string;
  image_url: string | null;
  description: string | null;
  unlocked_at?: string;
};

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("ID usuário logado:", user.id);

    if (!user) return;

    console.log("ID usuário:", user.id);

    const query = supabase
      .from("customer_products")
      .select("*")
      .eq("customer_id", user.id);

    const {
      data: customerProducts,
      error: customerError,
    } = await query;

    console.log("Resultado completo:", customerProducts);
    console.log("Erro:", customerError);

    console.log("Customer Products:", customerProducts);
    console.log("IDs encontrados:", customerProducts?.map(p => p.product_id));

if (customerError) {
  console.error(customerError);
  return;
}

if (!customerProducts?.length) {
  setProducts([]);
  return;
}
  
  const productIds = customerProducts.map(
  (item) => item.product_id
);
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      title,
      image_url
    `)
    .in("id", productIds);

console.log("Products:", data);
console.log("Products Error:", error);

if (error) {
  console.error(error);
  alert(JSON.stringify(error, null, 2));
  return;
}

const formattedProducts: Product[] =
  (data || []).map((product) => {
    const customer = customerProducts.find(
      (item) => item.product_id === product.id
    );

    return {
      id: product.id,
      title: product.title,
      image_url: product.image_url,
      description: null,
      unlocked_at: customer?.unlocked_at,
    };
  });

setProducts(formattedProducts);

}

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-black">
          📚 Meus Produtos
        </h1>

        <p className="text-zinc-400 mt-2">
          Todos os produtos liberados para sua conta.
        </p>

      </div>

      {products.length === 0 && (

        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-16
            text-center
          "
        >

          <h2 className="text-2xl font-bold">
            Nenhum produto encontrado
          </h2>

          <p className="text-zinc-500 mt-3">
            Assim que comprar um produto,
            ele aparecerá aqui.
          </p>

        </div>

      )}

      {products.length > 0 && (

  <div
    className="
      grid
      md:grid-cols-2
      xl:grid-cols-3
      gap-8
    "
  >

    {products.map((product) => (

      <div
        key={product.id}
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          overflow-hidden
          transition-all
          duration-300
          hover:border-green-500/40
          hover:-translate-y-1
          hover:shadow-2xl
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
            h-56
            object-cover
          "
        />

        <div className="p-6">

          <h2
            className="
              text-2xl
              font-bold
              mt-4
            "
          >
            {product.title}
          </h2>

          <p className="mt-3 text-zinc-400 line-clamp-2">
            {product.description || "Sem descrição."}
          </p>

      <div className="mt-6 space-y-3">

  <div className="flex items-center gap-2 text-green-400 text-sm">
    <span>🟢</span>
    <span>Produto liberado</span>
  </div>

  <div className="flex items-center gap-2 text-zinc-400 text-sm">
    <span>📅</span>

    <span>
      Comprado em{" "}
      {product.unlocked_at
        ? new Date(product.unlocked_at).toLocaleDateString("pt-BR")
        : "-"}
    </span>
  </div>

  <div className="flex items-center gap-2 text-zinc-400 text-sm">
    <span>📦</span>
    <span>Conteúdo disponível</span>
  </div>

</div>

          <Link
            href={`/dashboard/customer/products/${product.id}`}
            className="
              mt-8
              block
              w-full
              text-center
              rounded-2xl
              bg-green-500
              hover:bg-green-400
              text-black
              font-bold
              py-3
              transition-all
              duration-300
            "
          >
            Abrir Produto
          </Link>

        </div>

      </div>

    ))}

  </div>

)}

    </div>
  );
}
