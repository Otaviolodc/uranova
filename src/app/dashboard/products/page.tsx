"use client";

import { useProductUploads } from "@/hooks/useProductUploads";
import { validateProductDraft } from "@/lib/products/editor-validation";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";
import ProductForm from "@/components/products/ProductForm";
import ProductPreview from "@/components/products/ProductPreview";
import ProductList from "@/components/products/ProductList";
import ProductStats from "@/components/products/ProductStats";
import { supabase }
from "@/lib/supabase/client";

import { useCallback, useEffect, useRef, useState } from "react";

async function readProducts(): Promise<Product[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("SESSION_REQUIRED");


  const { data, error } = await supabase
    .from("products_checkout")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });



  if (error) throw error;
  return data || [];
}

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

const uploads = useProductUploads(updateField);
const saving = useRef(false);
const uncertainSave = useRef(false);
const [saveBlocked, setSaveBlocked] = useState(false);
const [notice, setNotice] = useState("");
const [listLoading, setListLoading] = useState(true);
const [listError, setListError] = useState("");
const listRequest = useRef(0);

const fetchProducts = useCallback(async () => {
  const request = ++listRequest.current;
  try {
  const data = await readProducts();
  if (request === listRequest.current) { setProducts(data || []); setListError(""); }
  } catch {
    if (request === listRequest.current) setListError("LIST_FAILED");
  } finally {
    if (request === listRequest.current) setListLoading(false);
  }
}, [setProducts]);

  useEffect(() => {
    let active = true;
    readProducts().then((data) => {
      if (active) { setProducts(data); setListError(""); }
    }, () => { if (active) setListError("LIST_FAILED"); })
      .finally(() => { if (active) setListLoading(false); });
    return () => { active = false; };
  }, [setProducts]);

async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const files = Array.from(e.target.files ?? []); e.target.value = "";
  if (saving.current || uncertainSave.current) return;
  await uploads.upload(files, "cover");
}

async function handleProductFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const files = Array.from(e.target.files ?? []); e.target.value = "";
  if (saving.current || uncertainSave.current) return;
  if (product.type === "pdf" || product.type === "ebook" || product.type === "bundle") {
    await uploads.upload(files, product.type);
  }
}

  async function handleCreate() {
    if (saving.current || uploads.isUploading() || uncertainSave.current) return;
    const validation = validateProductDraft(product);
    if (validation) { setNotice(validation); return; }
    saving.current = true; setNotice("");
    let persistenceStarted = false;
    let createdId: string | null = null;

    try {

      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {

        setNotice("Não foi possível confirmar sua sessão. Entre novamente antes de salvar.");
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

  persistenceStarted = true;
  const result =
    await supabase
      .from("products_checkout")
      .update({
        title: product.title,
        description: product.description,
        price: product.price,
        affiliate_url: product.affiliate_url,
        type: product.type,
        is_marketplace: product.is_marketplace,
        image_url: product.image_url,
        file_path: product.file_path,

})
.eq("id", product.id);

  error = result.error;

} else {

  persistenceStarted = true;
  // 1 - Criar produto principal
  const {
    data: createdProduct,
    error: productError,
  } = await supabase
    .from("products")
    .insert([
      {
        user_id: user.id,
        title: product.title,
        price: String(product.price),
        image_url: product.image_url,
        affiliate_url: product.affiliate_url,
        file_path: product.file_path,
        type: product.type,
      },
    ])
    .select()
    .single();

  if (productError) {

    error = productError;

  } else {

    createdId = createdProduct.id;
    // 2 - Criar checkout ligado ao produto
    const result =
      await supabase
        .from("products_checkout")
        .insert([
          {
            product_id: createdProduct.id,

            user_id: user.id,

            title: product.title,
            description: product.description,
            price: product.price,

            affiliate_url:
              product.affiliate_url,

            type:
              product.type,

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

}

      if (error) throw error;

      alert(
        product.id
          ? "Produto atualizado ✅"
          : "Produto criado 🚀"
      );

      resetProduct();
      uploads.clearDraft();

      await fetchProducts();

    } catch (error) {

      void error;
      uncertainSave.current = persistenceStarted;
      setSaveBlocked(persistenceStarted);
      setNotice(persistenceStarted
        ? (createdId ? `Cadastro incompleto: o produto ${createdId} foi criado, mas a segunda etapa não foi confirmada.` : "Não foi possível confirmar o resultado da gravação.")
          + " O formulário foi preservado e novos envios estão bloqueados nesta página para evitar duplicação. Confira os registros antes de recarregar ou tentar novamente. Nenhum registro ou arquivo foi excluído."
        : "Não foi possível confirmar sua sessão. Entre novamente antes de salvar.");

    } finally {

      saving.current = false;
      setLoading(false);

    }

  }

  function editProduct(product: Product) {
    if (saving.current || uploads.isUploading() || uncertainSave.current) return;
    uploads.clearDraft(); setNotice("");
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

    <div className="min-w-0 flex-1 p-4 md:p-8">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-3xl font-bold text-white">
          Produtos
      </h1>

      <p className="text-zinc-400 mt-2">
        Crie e gerencie seus produtos digitais
      </p>

    </div>

      <ProductStats products={products} />

      {notice && <p role="alert" className="mb-6 break-words text-amber-300">{notice}</p>}
      {uploads.message && <p role="status" className="mb-4 break-words text-zinc-300">{uploads.message}</p>}
      {uploads.uploading && <button onClick={uploads.cancel} className="mb-4 rounded-xl border px-4 py-2">Cancelar envio</button>}
      {uploads.canRetry && !loading && !saveBlocked && <button onClick={() => void uploads.retry()} className="mb-4 rounded-xl border px-4 py-2">Retomar envio</button>}
      {/* FORM */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <ProductForm
          product={product}
          updateField={(field, value) => {
            if (field === "type" && value !== product.type) uploads.clearDraft();
            updateField(field, value);
          }}
          loading={loading}
          uploading={uploads.uploading}
          saveBlocked={saveBlocked}
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

    {listLoading ? <p role="status" className="mt-10">Carregando produtos...</p>
      : listError ? <div role="alert" className="mt-10"><p>Não foi possível carregar os produtos. Confira sua conexão e sessão.</p><button onClick={() => { setListLoading(true); void fetchProducts(); }}>Tentar novamente</button></div>
      : products.length === 0 ? <p role="status" className="mt-10">Nenhum produto cadastrado.</p> : <ProductList
      products={products}
      editProduct={editProduct}
      deleteProduct={deleteProduct}
    />}
    
  </div>

</div>
);
}
