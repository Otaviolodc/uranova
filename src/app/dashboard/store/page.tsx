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

  const [
  affiliateUrl,
  setAffiliateUrl
] = useState("");

  const [productType, setProductType] =
    useState("ebook");

  const [imageUrl, setImageUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
  isMarketplace,
  setIsMarketplace
] = useState(false);

  const [
  editingId,
  setEditingId
] = useState<string | null>(null);

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

      let error;

if (editingId) {

  const result =
    await supabase
      .from("products_checkout")
      .update({
        title,
        description,
        price,

        affiliate_url:
          affiliateUrl,

        product_type: productType,

        is_marketplace:
          isMarketplace,

        image_url: imageUrl,
      })
      .eq("id", editingId);

  error = result.error;

} else {

  const result =
    await supabase
      .from("products_checkout")
      .insert([
        {
          user_id: user.id,

          title,
          description,
          price,

          affiliate_url:
            affiliateUrl,

          product_type:
            productType,

          status: "active",

          is_marketplace:
            isMarketplace,

          image_url:
            imageUrl,

          checkout_slug:
            slug,
        },
      ]);

  error = result.error;

}

      if (error) {
        alert(error.message);
        return;
      }

      alert(
  editingId
    ? "Produto atualizado ✅"
    : "Produto criado 🚀"
);

      setTitle("");
      setDescription("");
      setPrice("");
      setAffiliateUrl("");

      setProductType("ebook");
      setIsMarketplace(false);

      setImageUrl("");

      setEditingId(null);

      fetchProducts();

    } finally {

      setLoading(false);

    }

  }

  function editProduct(product: any) {
  setEditingId(product.id);

  setTitle(product.title);
  setDescription(product.description);
  setPrice(product.price);
  setImageUrl(product.image_url);

  setProductType(
    product.product_type || "ebook"
  );

  setIsMarketplace(
    product.is_marketplace || false
  );

  setAffiliateUrl(
    product.affiliate_url || ""
  );

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <p className="text-zinc-400 text-sm">
      Produtos
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {products.length}
    </h2>
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <p className="text-zinc-400 text-sm">
      Marketplace
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {
        products.filter(
          (p) => p.is_marketplace
        ).length
      }
    </h2>
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <p className="text-zinc-400 text-sm">
      Ativos
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {
        products.filter(
          (p) => p.status === "active"
        ).length
      }
    </h2>
  </div>

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

  <input
  placeholder="Link de Venda"
  value={affiliateUrl}
  onChange={(e) =>
    setAffiliateUrl(e.target.value)
  }
  className="
    w-full
    bg-zinc-800
    p-4
    rounded-2xl
  "
/>

    <select
  value={productType}
  onChange={(e) =>
    setProductType(e.target.value)
  }
  className="
    w-full
    bg-zinc-800
    p-4
    rounded-2xl
  "
>
  <option value="ebook">
    Ebook
  </option>

  <option value="curso">
    Curso
  </option>

  <option value="pdf">
    PDF
  </option>

  <option value="ferramenta">
    Ferramenta
  </option>

  <option value="mentoria">
    Mentoria
  </option>
</select>

<label
  className="
    flex
    items-center
    gap-3
    text-sm
    text-zinc-300
  "
>
  <input
    type="checkbox"
    checked={isMarketplace}
    onChange={(e) =>
      setIsMarketplace(
        e.target.checked
      )
    }
  />

  Publicar no Marketplace
</label>

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
  ? "Salvando..."
  : editingId
  ? "Atualizar Produto ✅"
  : "Criar Produto 🚀"}

</button>

</div>
    
</div>

<div>

{/* PREVIEW */}
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

</div>

     {/* MEUS PRODUTOS */}
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

          <div className="flex flex-wrap gap-2 mt-3">

            <span
              className="
                px-3
                py-1
                rounded-full
                bg-blue-500/10
                text-blue-400
                text-xs
                font-bold
              "
            >
              {product.product_type}
            </span>

            {product.is_marketplace && (
              <span
                className="
                  px-3
                  py-1
                  rounded-full
                  bg-purple-500/10
                  text-purple-400
                  text-xs
                  font-bold
                "
              >
                Marketplace
              </span>
            )}

          </div>

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
            ● {product.status}
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

);

}