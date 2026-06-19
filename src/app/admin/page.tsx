import { createClient }
from "@/lib/supabase/server";

export default async function AdminPage() {

  const supabase =
    await createClient();

  // USERS
  const { count: users } = await supabase
    .from("profiles")
    .select("*", {
      count: "exact",
      head: true,
    });

  // PRODUCTS
  const { count: products } = await supabase
    .from("links")
    .select("*", {
      count: "exact",
      head: true,
    });

  // ADMINS
  const { count: admins } = await supabase
    .from("profiles")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("role", "admin");

  return (

    <div>

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="
          text-3xl
          md:text-5xl
          font-bold
        ">

          Dashboard Admin 🚀

        </h1>

        <p className="
          text-zinc-400
          mt-3
          text-base
          md:text-lg
        ">

          Controle total da plataforma Uranova

        </p>

      </div>

      {/* CARDS */}
      <div className="
        grid
        md:grid-cols-2
        xl:grid-cols-3
        gap-6
      ">

        {/* USERS */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-5 
          md:p-8
        ">

          <p className="
            text-zinc-400
            mb-3
          ">

            Usuários

          </p>

          <h2 className="
            text-4xl md:text-6xl
            font-bold
          ">

            {users}

          </h2>

        </div>

        {/* PRODUCTS */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-5 
          md:p-8
        ">

          <p className="
            text-zinc-400
            mb-3
          ">

            Produtos

          </p>

          <h2 className="
            text-4xl md:text-6xl
            font-bold
          ">

            {products}

          </h2>

        </div>

        {/* ADMINS */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-5 
          md:p-8
        ">

          <p className="
            text-zinc-400
            mb-3
          ">

            Admins

          </p>

          <h2 className="
            text-4xl md:text-6xl
            font-bold
          ">

            {admins}

          </h2>

        </div>

        {/* CONVERSÃO */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-5 
          md:p-8
        ">

          <p className="
            text-zinc-400
            mb-3
          ">

            Conversão

          </p>

          <h2 className="
            text-4xl md:text-6xl
            font-bold
            text-green-400
          ">

            4.8%

          </h2>

        </div>

        {/* RECEITA */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-5 
          md:p-8
        ">

          <p className="
            text-zinc-400
            mb-3
          ">

            Receita

          </p>

          <h2 className="
            text-4xl md:text-6xl
            font-bold
            text-green-400
          ">

            R$ 12K

          </h2>

        </div>

        {/* STATUS */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-5 
          md:p-8
        ">

          <p className="
            text-zinc-400
            mb-3
          ">

            Sistema

          </p>

          <h2 className="
            text-3xl md:text-4xl
            font-bold
            text-green-400
          ">

            Online

          </h2>

        </div>

      </div>

    </div>

  );

}