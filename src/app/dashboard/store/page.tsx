"use client";

import { supabase }
from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function StorePage() {

  const [products, setProducts] =
    useState<any[]>([]);

  const fetchProducts = async () => {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("products_checkout")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  setProducts(data || []);
};

useEffect(() => {
  fetchProducts();
}, []);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleUpload(
    e: any
  ) {

    const file = e.target.files?.[0];

    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const fileExt =
      file.name.split(".").pop();

    const fileName =
      `${user.id}-${Date.now()}.${fileExt}`;

    const { error } =
      await supabase.storage
        .from("products")
        .upload(fileName, file);

    if (error) {
      alert(error.message);
      return;
    }

    const { data } =
      supabase.storage
        .from("products")
        .getPublicUrl(fileName);

    setImageUrl(data.publicUrl);

  }

  async function handleCreate() {

    try {

      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const slug =
        title
          .toLowerCase()
          .replace(/\s+/g, "-") +
        "-" +
        Date.now();

      const { error } =
        await supabase
          .from("products_checkout")
          .insert([
            {
              user_id: user.id,

              title,
              description,
              price,

              image_url: imageUrl,

              checkout_slug: slug,
            },
          ]);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Produto criado 🚀");

      setTitle("");
      setDescription("");
      setPrice("");
      setImageUrl("");

      fetchProducts();

    } finally {

      setLoading(false);

    }

  }

  function editProduct(product: any) {

  setTitle(product.title);
  setDescription(product.description);
  setPrice(product.price);
  setImageUrl(product.image_url);

}

async function deleteProduct(id: string) {

  const confirmDelete =
    confirm("Deseja excluir este produto?");

  if (!confirmDelete) return;

  await supabase
    .from("products_checkout")
    .delete()
    .eq("id", id);

  fetchProducts();

}

  return (

  <div className="flex bg-black text-white min-h-screen">

    <div className="flex-1 p-8">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          🚀 Crie e venda produtos digitais
        </h1>

        <p className="text-gray-400 mt-2 text-lg">
          Monte ofertas profissionais para compartilhar e vender online.
        </p>

      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-8
          "
        >

          <h2 className="text-2xl font-bold mb-6">
             Novo Produto
          </h2>

          <div className="space-y-4">

  <input
    placeholder="Título"
    value={title}
    onChange={(e) =>
      setTitle(e.target.value)
    }
    className="w-full bg-zinc-800 p-4 rounded-2xl"
  />

  <textarea
    placeholder="Descrição"
    value={description}
    onChange={(e) =>
      setDescription(e.target.value)
    }
    className="w-full bg-zinc-800 p-4 rounded-2xl h-32"
  />

  <input
    placeholder="Preço"
    value={price}
    onChange={(e) =>
      setPrice(e.target.value)
    }
    className="w-full bg-zinc-800 p-4 rounded-2xl"
  />

  <select
    className="
      w-full
      bg-zinc-800
      p-4
      rounded-2xl
    "
  >
    <option>Ebook</option>
    <option>Curso</option>
    <option>PDF</option>
    <option>Ferramenta</option>
    <option>Mentoria</option>
  </select>

            <label
              className="
                border-2
                border-dashed
                border-zinc-700
                rounded-2xl
                p-8
                flex
                justify-center
                items-center
                cursor-pointer
                hover:border-green-500
                transition-all
              "
            >

              📸 Upload da capa

              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
             />

            </label>
            
            {imageUrl && (

              <img
                src={imageUrl}
                className="w-48 rounded-2xl"
              />


            )}

            <button
  onClick={handleCreate}
  disabled={loading}
  className="
    w-full
    bg-green-500
    hover:bg-green-400
    transition
    text-black
    px-8
    py-4
    rounded-2xl
    font-bold
  "
>

  {loading
    ? "Criando..."
    : "Criar Produto 🚀"}

</button>
    
          </div>

          <div
  className="
    bg-zinc-900
    border
    border-zinc-800
    rounded-3xl
    p-8
    sticky
    top-8
    h-fit
  "
>

  <h2 className="text-2xl font-bold mb-6">
    👀 Preview
  </h2>

  <div className="bg-zinc-800 rounded-2xl overflow-hidden">

    {imageUrl ? (

      <img
        src={imageUrl}
        className="
          w-full
          h-72
          object-cover
        "
      />

    ) : (

      <div
        className="
          h-72
          flex
          items-center
          justify-center
          text-zinc-500
        "
      >
        Sem imagem
      </div>

    )}

  </div>

  <h3 className="text-2xl font-black mt-6">
    {title || "Seu produto"}
  </h3>

  <p className="text-zinc-400 mt-3">
    {description ||
      "A descrição aparecerá aqui."}
  </p>

  <p className="text-4xl font-black text-green-400 mt-6">
    R$ {price || "0,00"}
  </p>

  <button
    type="button"
    className="
      mt-6
      w-full
      bg-gradient-to-r
      from-green-500
      to-emerald-400
      text-black
      py-4
      rounded-2xl
      font-black
    "
  >
    Comprar Agora
  </button>

</div>

</div>

        <div className="mt-14">

  <h2 className="text-3xl font-bold mb-8">
    📦 Meus Produtos
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

    {products.map((product) => (

      <div
        key={product.id}
        className="
          bg-zinc-900
          border
          border-zinc-800
          hover:border-green-500/30
          transition-all
          rounded-3xl
          p-8
        "
      >

        <img
          src={product.image_url}
          className="
            w-full
            h-56
            object-cover
            rounded-2xl
          "
       />

        <div className="p-5">

          <h3 className="text-xl font-bold">
            {product.title}
          </h3>

          <div
            className="
              inline-flex
              mt-3
              px-3
              py-1
              rounded-full
              bg-green-500/10
              text-green-400
              text-xs
              font-bold
            "
          >

            ● Ativo

          </div>

          <p className="text-green-400 text-3xl font-black mt-4">
            R$ {product.price}
          </p>

          <div className="flex gap-3 mt-6">

            <button
              onClick={() => editProduct(product)}
              className="flex-1 bg-blue-500 hover:bg-blue-400 text-black py-3 rounded-2xl font-semibold"
            >
            Editar
            </button>

            <button
              onClick={() => deleteProduct(product.id)}
              className="flex-1 bg-red-500 hover:bg-red-400 text-black py-3 rounded-2xl font-semibold"
            >
            Excluir
            </button>

          </div>

          <a
            href={`/product/${product.id}`}
            target="_blank"
            className="
              mt-4
              block
              text-center
              bg-green-500
              hover:bg-green-400
              text-black
              py-3
              rounded-2xl
              font-bold
            "
          >
            Abrir Página 🚀
          </a>

        </div>

      </div>

    ))}

  </div>

</div>

</div>

</div>

</div>

);

}