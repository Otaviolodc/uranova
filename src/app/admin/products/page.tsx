import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {

  const supabase = await createClient();

  const { data: links } = await supabase
    .from("links")
    .select("*");

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

            Gerencie todos os produtos e links

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

          Total: {links?.length || 0}

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
          grid-cols-4
          gap-4
          p-5
          border-b
          border-zinc-800
          text-zinc-400
          text-sm
          font-medium
        ">

          <div>Título</div>
          <div>Slug</div>
          <div>Status</div>
          <div>Ações</div>

        </div>

        {/* PRODUCTS */}
        {links?.map((link) => (

          <div
            key={link.id}
            className="
              grid
              grid-cols-4
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

              {link.title || "Sem título"}

            </div>

            {/* SLUG */}
            <div className="text-zinc-400">

              {link.slug || "-"}

            </div>

            {/* STATUS */}
            <div>

              <span className="
                bg-green-500/20
                text-green-400
                border
                border-green-500/20
                px-3
                py-1
                rounded-lg
                text-sm
              ">

                Ativo

              </span>

            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">

              <button className="
                bg-blue-500
                hover:bg-blue-400
                transition
                px-3
                py-2
                rounded-lg
                text-sm
                font-medium
              ">

                Editar

              </button>

              <button className="
                bg-red-500
                hover:bg-red-400
                transition
                px-3
                py-2
                rounded-lg
                text-sm
                font-medium
              ">

                Excluir

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}