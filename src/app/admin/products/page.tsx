import Link from "next/link";
import { createClient }
from "@/lib/supabase/server";

export default async function ProductsPage() {

  const supabase =
    await createClient();

  const { data: products } = await supabase
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
    .order("created_at", {
      ascending: false,
    });

  return (

    <div>

      {/* HEADER */}
      <div className="
        flex
        items-center
        justify-between
        mb-8
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
          ">

            Produtos

          </h1>

          <p className="
            text-zinc-400
            mt-2
          ">

            Gerencie todos os produtos do Marketplace

          </p>

        </div>

        <div className="
          bg-zinc-900
          border
          border-zinc-800
          px-4
          py-2
          rounded-xl
        ">

          Total: {products?.length || 0}

        </div>

      </div>

      {/* TABLE */}
      <div className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        overflow-hidden
      ">

        {/* HEADER */}
        <div className="
          grid
          grid-cols-5
          gap-4
          p-5
          border-b
          border-zinc-800
          text-zinc-400
          text-sm
          font-medium
        ">

          <div>Produto</div>
          <div>Preço</div>
          <div>Tipo</div>
          <div>Cadastro</div>
          <div>Ações</div>

        </div>

        {/* PRODUCTS */}
        {products?.map((product) => (

          <div
            key={product.id}
            className="
              grid
              grid-cols-5
              gap-4
              p-5
              border-b
              border-zinc-800
              items-center
              hover:bg-zinc-800/40
              transition
            "
          >

            {/* TITLE */}
            <div className="font-medium">

              {product.title || "Sem título"}

            </div>

            {/* PRICE */}
            <div className="text-zinc-300">
              R$ {Number(product.price).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>

            {/* TYPE */}
            <div>
              {product.type || "-"}
            </div>

            {/* CREATED */}
            <div className="text-zinc-400 text-sm">
              {product.created_at
                ? new Date(product.created_at).toLocaleDateString("pt-BR")
                : "-"}
              </div>

            {/* ACTIONS */}
            <div className="flex">
              <Link
                href={`/admin/products/${product.id}`}
                className="
                  bg-blue-500
                  hover:bg-blue-400
                  transition
                  px-3
                  py-2
                  rounded-lg
                  text-sm
                  font-medium
                  inline-flex
                  items-center
                "
              >
                Visualizar
              </Link>
            </div>

          </div>

        ))}

      </div>

    </div>

  );

}