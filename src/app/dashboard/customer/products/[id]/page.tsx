"use client";

import { useEffect, useRef, useState } from "react";
import CatalogImage from "@/components/marketplace/CatalogImage";
import { useParams } from "next/navigation";
import Link from "next/link";
import { preferredAccess, readableDate } from "@/lib/customer-library";
import { activeAccess } from "@/lib/security/validation";
import { normalizeCategory, publicHttpUrl } from "@/lib/public-catalog";
import { isCourse, isMentoring } from "@/lib/courses";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  file_path: string | null;
  type: string | null;

  purchased_at?: string;
  order_id?: string;
};

type PackFile = {
  path: string;
  name: string;
};

export default function CustomerProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return <CustomerProductContent key={id} id={id} />;
}

function CustomerProductContent({ id }: { id: string }) {
  const [loadError, setLoadError] = useState(false);
  const [missing, setMissing] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const downloading = useRef(false);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [hasAccess, setHasAccess] =
    useState(true);


  async function openSingleFile(filePath: string) {
    if (!product?.file_path || downloading.current) return;
    downloading.current = true; setDownloadError("");
    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    try {
      const paths = product.file_path.startsWith("[") ? JSON.parse(product.file_path) : [product.file_path];
      const index = paths.indexOf(filePath);
      if (index < 0) throw new Error();
      const response = await fetch("/api/files/download", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId:product.id,index})});
      const data = await response.json();
      if (!response.ok) throw new Error();
      if (!publicHttpUrl(data.url)) throw new Error();
      if (!popup) throw new Error("POPUP_BLOCKED");
      popup.location.href = data.url;
    } catch { popup?.close(); setDownloadError("Download indisponível ou bloqueado pelo navegador. Verifique seu acesso e permita abrir uma nova aba para tentar novamente."); }
    finally { downloading.current = false; }
  }

  useEffect(() => {
    let active = true;
    async function fetchProduct() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("SESSION_REQUIRED");
        const { data: accesses, error: accessError } = await supabase
          .from("customer_products")
          .select("id,product_id,status,expires_at,unlocked_at,order_id")
          .eq("customer_id", user.id)
          .eq("product_id", id)
          .eq("status", "active");
        if (accessError) throw accessError;
        const access = preferredAccess((accesses ?? []).filter(item => activeAccess(item)));
        if (!access) { if (active) setHasAccess(false); return; }
        const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        if (!data) { if (active) setMissing(true); return; }
        if (active) setProduct({
          id: data.id, title: data.title, image_url: data.image_url, file_path: data.file_path,
          description: data.description ?? null, type: data.type ?? null,
          purchased_at: access.unlocked_at, order_id: access.order_id,
        });
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchProduct();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="p-10">
        Carregando produto...
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-3xl mx-auto py-16">
        <div
          className="
            bg-zinc-900
            border
            border-red-500/30
            rounded-3xl
            p-10
            text-center
          "
        >
          <div className="text-6xl mb-6">
            🔒
          </div>

          <h1 className="text-4xl font-black">
            Acesso Negado
          </h1>

          <p className="text-zinc-400 mt-4">
            Você ainda não possui acesso
            a este produto.
          </p>

          <Link
            href="/dashboard/marketplace"
            className="
              inline-block
              mt-8
              bg-green-500
              hover:bg-green-400
              text-black
              font-bold
              px-8
              py-4
              rounded-2xl
            "
          >
            Ir para Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (missing) return <p role="status" className="p-8">Este produto não está disponível. <Link href="/dashboard/customer/products">Voltar à biblioteca</Link></p>;

  if (loadError || !product) {
    return <div role="alert" className="p-10">Não foi possível carregar o produto. Confira sua sessão e conexão e atualize a página para tentar novamente.</div>;
  }

  const isBundle =
    normalizeCategory(product?.type) === "bundle";

  if (isMentoring(product.type) || isCourse(product.type)) {
    const course = isCourse(product.type);
    let materials: string[] = [];
    try {
      const value: unknown = product.file_path?.startsWith("[") ? JSON.parse(product.file_path) : product.file_path ? [product.file_path] : [];
      if (Array.isArray(value) && value.every(path => typeof path === "string" && path.length > 0)) materials = value;
    } catch { /* Legacy malformed reference: do not invent a download target. */ }
    return <section className="max-w-3xl p-4 sm:p-8 space-y-5">
      {downloadError && <p role="alert">{downloadError}</p>}
      <h1 className="text-3xl font-bold">{product.title}</h1>
      <p>{course ? "Curso" : "Mentoria"}</p>
      {product.description && <p className="whitespace-pre-wrap break-words">{product.description}</p>}
      {course ? <Link href={`/dashboard/my-courses/${product.id}`} className="inline-block rounded-xl bg-blue-600 px-5 py-3">Acessar curso</Link> : <p role="status">O agendamento e os links de reunião não estão disponíveis nesta área. Consulte as instruções recebidas do produtor. Nenhuma sessão foi agendada automaticamente.</p>}
      {materials.map((path, index) => <button key={`${path}-${index}`} onClick={() => openSingleFile(path)} className="block rounded-xl bg-green-600 px-5 py-3">Baixar material complementar {index + 1}</button>)}
      <Link href="/dashboard/customer/products" className="inline-block underline">Voltar aos meus produtos</Link>
    </section>;
  }

  const isEbook =
    normalizeCategory(product?.type) === "ebook";

  const productLabel = isBundle
    ? "📦 Pack de Arquivos"
    : isEbook
    ? "📘 E-book"
    : "📄 PDF";

  /*
   * Converte o file_path do Pack em uma lista.
   *
   * Exemplo:
   *
   * [
   *   "products/arquivo1.pdf",
   *   "products/arquivo2.zip"
   * ]
   */
  let packFiles: PackFile[] = [];

  if (isBundle && product?.file_path) {
    try {
      const parsed =
        JSON.parse(product.file_path);

      if (Array.isArray(parsed) && parsed.every((path) => typeof path === "string" && path.length > 0)) {
        packFiles = parsed.map(
          (path: string) => ({
            path,
            name:
              path.split("/").pop() ||
              "Arquivo",
          })
        );
      }
    } catch {
      console.error(
        "Erro ao interpretar arquivos do Pack."
      );
    }
  }

  const fileName =
    product?.file_path &&
    !isBundle
      ? product.file_path
          .split("/")
          .pop()
      : null;

  const singleDownloadLabel =
    isEbook
      ? "📖 Baixar E-book"
      : "⬇ Baixar PDF";

  return (
    <div className="space-y-8">
      {downloadError && <p role="alert">{downloadError}</p>}

      <div>
        <h1 className="text-4xl font-black">
          {productLabel}
        </h1>

        <p className="text-zinc-400 mt-2">
          Área exclusiva do produto adquirido.
        </p>
      </div>

      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          overflow-hidden
        "
      >

        <CatalogImage src={product.image_url} alt={product.title} className="w-full h-72" />

        <div className="p-8">

          <h1
            className="
              text-4xl
              font-black
              mt-6
            "
          >
            {product.title}
          </h1>

          <p
            className="
              text-zinc-400
              mt-6
              leading-8
            "
          >
            {product.description ??
              "Sem descrição."}
          </p>

          <div
            className="
              mt-10
              grid
              md:grid-cols-3
              gap-5
            "
          >

            <div
              className="
                bg-zinc-800
                rounded-2xl
                p-5
              "
            >
              <p className="text-zinc-500 text-sm">
                Produto
              </p>

              <h3 className="text-xl font-bold mt-2">
                {productLabel}
              </h3>
            </div>

            <div
              className="
                bg-zinc-800
                rounded-2xl
                p-5
              "
            >
              <p className="text-zinc-500 text-sm">
                Status
              </p>

              <h3 className="text-xl font-bold mt-2 text-green-400">
                Liberado
              </h3>
            </div>

            <div
              className="
                bg-zinc-800
                rounded-2xl
                p-5
              "
            >
              <p className="text-zinc-500 text-sm">
                Conteúdo
              </p>

              <h3 className="text-xl font-bold mt-2">
                {isBundle
                  ? `${packFiles.length} Arquivo${
                      packFiles.length === 1
                        ? ""
                        : "s"
                    }`
                  : "1 Arquivo"}
              </h3>
            </div>

          </div>

          <div
            className="
              mt-8
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-950
              p-6
              space-y-4
            "
          >

            <h2 className="text-lg font-bold text-green-400">
              🟢 Produto liberado para sua conta
            </h2>

            <div className="space-y-2 text-zinc-300">

              <p>
                📅{" "}
                <span className="font-medium">
                  Liberado em:
                </span>{" "}
                {readableDate(product.purchased_at)}
              </p>

              {isBundle ? (
                <p>
                  📦{" "}
                  <span className="font-medium">
                    Arquivos:
                  </span>{" "}
                  {packFiles.length} disponíveis
                </p>
              ) : (
                <p>
                  {isEbook
                    ? "📘"
                    : "📄"}{" "}
                  <span className="font-medium">
                    Arquivo:
                  </span>{" "}
                  {fileName ||
                    product.title}
                </p>
              )}

              <p>
                ☁️{" "}
                <span className="font-medium">
                  Download disponível
                </span>
              </p>

            </div>

            <p className="text-sm text-zinc-500">
              Este conteúdo permanecerá disponível
              na sua biblioteca enquanto sua conta
              estiver ativa.
            </p>

          </div>

          {isBundle ? (

            <div
              className="
                mt-10
                rounded-2xl
                border
                border-orange-500/30
                bg-orange-500/5
                p-6
              "
            >

              <div className="mb-6">

                <h2 className="text-2xl font-bold">
                  📦 Arquivos do Pack
                </h2>

                <p className="text-zinc-400 mt-2">
                  Baixe individualmente cada
                  arquivo disponível.
                </p>

              </div>

              {packFiles.length > 0 ? (

                <div className="space-y-3">

                  {packFiles.map(
                    (file, index) => (

                      <div
                        key={`${file.path}-${index}`}
                        className="
                          bg-zinc-800
                          border
                          border-zinc-700
                          rounded-2xl
                          p-5
                          flex
                          items-center
                          justify-between
                          gap-5
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-4
                            min-w-0
                          "
                        >

                          <div
                            className="
                              w-12
                              h-12
                              rounded-xl
                              bg-orange-500/10
                              flex
                              items-center
                              justify-center
                              text-2xl
                              shrink-0
                            "
                          >
                            📄
                          </div>

                          <div className="min-w-0">

                            <p className="text-xs text-zinc-500">
                              Arquivo {index + 1}
                            </p>

                            <h3
                              className="
                                font-semibold
                                truncate
                              "
                              title={file.name}
                            >
                              {file.name}
                            </h3>

                          </div>

                        </div>

                        <button
                          onClick={() =>
                            openSingleFile(
                              file.path
                            )
                          }
                          className="
                            shrink-0
                            bg-green-500
                            hover:bg-green-400
                            text-black
                            font-bold
                            px-5
                            py-3
                            rounded-xl
                            transition
                          "
                        >
                          ⬇ Baixar
                        </button>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div
                  className="
                    rounded-2xl
                    border
                    border-yellow-500/30
                    bg-yellow-500/10
                    p-6
                    text-yellow-300
                  "
                >
                  Nenhum arquivo foi encontrado
                  neste Pack.
                </div>

              )}

            </div>

          ) : product.file_path ? (

            <div
              className="
                mt-10
                bg-zinc-800
                rounded-2xl
                border
                border-zinc-700
                p-6
                flex
                items-center
                justify-between
                gap-6
              "
            >

              <div>

                <p className="text-zinc-500 text-sm">
                  {isEbook
                    ? "E-book"
                    : "Arquivo Principal"}
                </p>

                <h3 className="text-xl font-bold mt-2">
                  {product.title}
                </h3>

                <p className="text-green-400 mt-2">
                  Conteúdo disponível
                </p>

              </div>

              <button
                onClick={() =>
                  openSingleFile(
                    product.file_path!
                  )
                }
                className="
                  bg-green-500
                  hover:bg-green-400
                  text-black
                  font-bold
                  px-8
                  py-4
                  rounded-2xl
                "
              >
                {singleDownloadLabel}
              </button>

            </div>

          ) : (

            <div
              className="
                mt-10
                rounded-2xl
                border
                border-yellow-500/30
                bg-yellow-500/10
                p-6
              "
            >
              Este produto ainda não possui
              conteúdo disponível.
            </div>

          )}

        </div>

      </div>

    </div>
  );
}
