import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function StorePage({
  params,
}: {
  params: { username: string };
}) {

  const { username } = params;

  const supabase = await createClient();

  // PROFILE
const {
  data: profile,
  error: profileError,
} = await supabase
  .from("profiles")
  .select(`
    id,
    username,
    bio,
    avatar_url
  `)
  .eq("username", username)
  .maybeSingle();

  if (profileError || !profile) {

  return (
    <div className="
      min-h-screen
      bg-black
      text-white
      flex
      items-center
      justify-center
    ">
      Loja não encontrada
    </div>
  );

}
  
  // PRODUCTS
const {
  data: products,
} = await supabase
  .from("products")
  .select(`
    id,
    title,
    price,
    image_url,
    affiliate_url
  `)
  .eq("user_id", profile.id);

  const safeProducts = products || [];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
      <div className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">

          <div className="flex flex-col md:flex-row items-center gap-8">

            <Image
              src={
                profile.avatar_url ||
                "/avatar.png"
              }
              alt={profile.username}
              width={128}
              height={128}
              unoptimized
              className="
                w-32
                h-32
                rounded-full
                border-4
                border-green-500
                object-cover
              "
            />

            <div>

              <h1 className="text-5xl font-black">
                {profile?.username}
              </h1>

              <p className="text-zinc-400 mt-3 text-lg">
                {profile?.bio}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* SEARCH */}
      <div className="max-w-7xl mx-auto px-6">

        <input
          type="text"
          placeholder="🔍 Buscar produto..."
          className="
            w-full
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            px-6
            py-5
            outline-none
            text-lg
            mb-10
          "
        />

      </div>

      {/* MARKETPLACES */}
      <div className="max-w-7xl mx-auto px-6 flex gap-4 overflow-x-auto pb-6">

        {[
          "Todos",
          "Shopee",
          "Amazon",
          "Hotmart",
          "Eduzz",
          "Braip",
        ].map((item) => (

          <button
            key={item}
            className="
              whitespace-nowrap
              px-6
              py-3
              rounded-2xl
              bg-zinc-900
              hover:bg-green-500
              hover:text-black
              transition
              font-semibold
            "
          >
            {item}
          </button>

        ))}

      </div>

      {/* TITLE */}
      <div className="max-w-7xl mx-auto px-6 mt-8 mb-8">

        <h2 className="text-4xl font-black">
          🔥 Produtos Recomendados
        </h2>

        <p className="text-zinc-400 mt-2">
          Produtos selecionados da loja
        </p>

      </div>

      {/* GRID */}
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          gap-6
          pb-20
        "
      >

        {safeProducts.length === 0 ? (

  <div className="
    col-span-full
    text-center
    text-zinc-400
    py-20
  ">
    Nenhum produto encontrado
  </div>

) : (

  safeProducts.map((product) => (

    <div
      key={product.id}
      className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        overflow-hidden
        hover:border-green-500
        hover:-translate-y-2
        transition-all
        duration-300
      "
    >

      {/* IMAGE */}
      <div className="relative">

        <Image
          src={
            product.image_url ||
            "/logo.png"
          }
          alt={product.title}
          width={500}
          height={500}
          unoptimized
          className="
            w-full
            h-72
            object-cover
          "
        />

        <div className="absolute top-4 left-4 bg-green-500 text-black text-xs font-black px-3 py-1 rounded-full">
          PROMO
        </div>

      </div>

      {/* CONTENT */}
      <div className="p-5">

        <h3 className="font-bold text-xl line-clamp-2 min-h-[60px]">
          {product.title}
        </h3>

        <div className="mt-4">

          <span className="text-4xl font-black text-green-400">
            R$ {product.price}
          </span>

        </div>

        <a
          href={product.affiliate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="
            block
            w-full
            mt-5
            bg-green-500
            hover:bg-green-400
            transition
            text-black
            py-4
            rounded-2xl
            font-black
            text-lg
            text-center
          "
        >

          Comprar Agora

        </a>

      </div>

    </div>

  ))

)}

      </div>

    </div>
  );
}