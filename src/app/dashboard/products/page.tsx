"use client";

import { uploadPrivateFile } from "@/lib/services/storage.service";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import ProductForm from "@/components/products/ProductForm";
import ProductPreview from "@/components/products/ProductPreview";
import ProductList from "@/components/products/ProductList";
import ProductStats from "@/components/products/ProductStats";
import { supabase }
from "@/lib/supabase/client";

import { useEffect } from "react";

export default function StorePage() {

  const {
  product,
  setProduct,

  products,
  setProducts,

  loading,
  setLoading,

  updateField,

  resetProduct,
} = useProducts();

const fetchProducts = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  console.log("USER:", user.id);

  const { data, error } = await supabase
    .from("products_checkout")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    console.error(error);
    return;
  }

  setProducts(data || []);
};

  useEffect(() => {
  fetchProducts();
}, []);
   
  async function handleUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  console.log("UPLOAD INICIADO");

  const file = e.target.files?.[0];

  console.log("ARQUIVO:", file);

  if (!file) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("USER:", user);

  if (!user) return;

  const fileExt = file.name.split(".").pop();

  const fileName =
    `${user.id}-${Date.now()}.${fileExt}`;

  console.log("NOME:", fileName);

  const { error } =
    await supabase.storage
      .from("products-images")
      .upload(fileName, file);

  console.log("UPLOAD ERROR:", error);

  if (error) {
    alert(error.message);
    return;
  }

  const { data } =
    supabase.storage
      .from("products-images")
      .getPublicUrl(fileName);

  console.log("PUBLIC URL:", data.publicUrl);

  updateField(
    "image_url",
    data.publicUrl
  );
}

async function handleProductFileUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  console.log("=== UPLOAD PRODUTO ===");

  const file = e.target.files?.[0];

  console.log("FILE:", file);

  if (!file) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("USER:", user);

  if (!user) return;

  const fileExt = file.name.split(".").pop();

  const fileName =
    `${user.id}-${Date.now()}.${fileExt}`;

  console.log("FILE NAME:", fileName);

  const filePath = await uploadPrivateFile(
    "products",
    file,
    fileName
  );

  console.log("FILE PATH:", filePath);

  if (!filePath) {
    alert("Erro ao enviar o arquivo.");
    return;
  }

  updateField("file_path", filePath);

  console.log("STATE ATUALIZADO");
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
        product.title
          .toLowerCase()
          .replace(/\s+/g, "-") +
        "-" +
        Date.now();

      let error;

if (product.id) {

  const result =
    await supabase
      .from("products_checkout")
      .update({
        title: product.title,
        description: product.description,
        price: product.price,

        affiliate_url:
          product.affiliate_url,

        product_type:
          product.product_type,

        is_marketplace:
          product.is_marketplace,

        image_url: 
          product.image_url,

        file_path: product.file_path,
})
.eq("id", product.id);

  error = result.error;

} else {

  const result =
    await supabase
      .from("products_checkout")
      .insert([
        {
          user_id: user.id,

          title: product.title,
          description: product.description,
          price: product.price,

          affiliate_url:
            product.affiliate_url,

          product_type:
            product.product_type,

          status: "active",

          is_marketplace:
            product.is_marketplace,

          image_url: 
            product.image_url,

          file_path: 
            product.file_path,

          checkout_slug: slug,
        },
      ]);

  error = result.error;

}

      if (error) {
        alert(error.message);
        return;
      }

      alert(
        product.id
          ? "Produto atualizado ✅"
          : "Produto criado 🚀"
      );

      resetProduct();

      await fetchProducts();

    } catch (error) {

      console.error(error);

      alert("Erro ao salvar produto");

    } finally {

      setLoading(false);

    }

  }

  function editProduct(product: Product) {
    setProduct(product);
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
          product={product}
          updateField={updateField}
          loading={loading}
          editingId={product.id || null}
          handleUpload={handleUpload}
          handleProductFileUpload={handleProductFileUpload}
          handleCreate={handleCreate}
        />
        <ProductPreview
          title={product.title}
          description={product.description ?? ""}
          price={product.price}
          imageUrl={product.image_url ?? ""}
        />

      </div>

    <ProductList
      products={products}
      editProduct={editProduct}
      deleteProduct={deleteProduct}
    />
    
  </div>

</div>


);

}
