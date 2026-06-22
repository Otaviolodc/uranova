"use client";

import ProductForm from "@/components/products/ProductForm";
import ProductPreview from "@/components/products/ProductPreview";
import ProductList from "@/components/products/ProductList";
import ProductStats from "@/components/products/ProductStats";
import { supabase }
from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function StorePage() {

  type Product = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  image_url: string | null;
  affiliate_url: string | null;
  product_type: string | null;
  is_marketplace: boolean;
  status: string;
  checkout_slug: string;
};

  const [products, setProducts] =
    useState<Product[]>([]);

  const fetchProducts = async () => {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const {
  data,
  error,
} = await supabase
  .from("products_checkout")
  .select(`
    id,
    title,
    description,
    price,
    image_url,
    affiliate_url,
    product_type,
    is_marketplace,
    status,
    checkout_slug
  `)
  .eq("user_id", user.id)
  .order("created_at", {
    ascending: false,
  });

if (error) {

  console.error(error);

  return;

}

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
  e: React.ChangeEvent<HTMLInputElement>
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

      if (!user) {

        setLoading(false);

        return;

      }

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

    } catch (error) {

      console.error(error);

      alert("Erro ao salvar produto");

    } finally {

      setLoading(false);

    }

  }

  function editProduct(product: Product) {
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

  const { error } = await supabase
    .from("products_checkout")
    .delete()
    .eq("id", id);

  if (error) {

    alert(error.message);

    return;

  }

  fetchProducts();

}

  return (

  <div className="flex bg-black text-white min-h-screen">

    <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-2xl md:text-4xl font-bold">
          🚀 Crie e venda produtos digitais
        </h1>

        <p className="text-gray-400 mt-2 text-lg">
          Monte ofertas profissionais para compartilhar e vender online.
        </p>

      </div>

      <ProductStats products={products} />

      {/* FORM */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <ProductForm
  title={title}
  description={description}
  price={price}
  affiliateUrl={affiliateUrl}
  productType={productType}
  isMarketplace={isMarketplace}
  imageUrl={imageUrl}
  loading={loading}
  editingId={editingId}
  setTitle={setTitle}
  setDescription={setDescription}
  setPrice={setPrice}
  setAffiliateUrl={setAffiliateUrl}
  setProductType={setProductType}
  setIsMarketplace={setIsMarketplace}
  handleUpload={handleUpload}
  handleCreate={handleCreate}
/>

<div>

<ProductPreview
  title={title}
  description={description}
  price={price}
  imageUrl={imageUrl}
/>

</div>

    <ProductList
      products={products}
      editProduct={editProduct}
      deleteProduct={deleteProduct}
    />
    
  </div>

</div>

</div>

);

}
