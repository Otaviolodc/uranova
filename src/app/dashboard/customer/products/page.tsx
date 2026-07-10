"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  title: string;
  image_url: string | null;
  description: string | null;
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

    if (!user) return;

    const { data: customerProducts, error: customerError } =
  await supabase
    .from("customer_products")
    .select("product_id")
    .eq("customer_id", user.id)
    .eq("status", "active");

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
    image_url,
    description
  `)
  .in("id", productIds);

  if (error) {
  console.error(error);
  return;
}

setProducts(data || []);

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

          <Link
            href={`/dashboard/customer/products/${product.id}`}
            className="
              mt-6
              block
              w-full
              text-center
              bg-green-500
              hover:bg-green-400
              text-black
              font-bold
              py-3
              rounded-2xl
              transition
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
