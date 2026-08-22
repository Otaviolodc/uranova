"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  const { id } = useParams();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [hasAccess, setHasAccess] =
    useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function openSingleFile(filePath: string) {
    const { data, error } =
      await supabase.storage
        .from("products")
        .createSignedUrl(
          filePath,
          60 * 30
        );

    if (error) {
      console.error(error);
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function fetchProduct() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: accesses, error: accessError } =
      await supabase
        .from("customer_products")
        .select(`
          id,
          unlocked_at,
          order_id
        `)
        .eq("customer_id", user.id)
        .eq("product_id", id)
        .eq("status", "active");

    if (accessError) {
      console.error(accessError);
      setLoading(false);
      return;
    }

    const access = accesses?.[0];

    if (!access) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    console.log("Produto encontrado:", data);
    console.log("Erro produto:", error);
    console.log("ID recebido:", id);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (!data) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    setProduct({
      id: data.id,
      title: data.title,
      image_url: data.image_url,
      file_path: data.file_path,
      description: data.description ?? null,
      type: data.type ?? null,
      purchased_at: access.unlocked_at,
      order_id: access.order_id,
    });

    setLoading(false);
  }

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

          <a
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
          </a>
        </div>
      </div>
    );
  }

  const isBundle =
    product?.type === "bundle";

  const isEbook =
    product?.type === "ebook";

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

      if (Array.isArray(parsed)) {
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

        <img
          src={
            product.image_url ||
            "/placeholder.png"
          }
          alt={product.title}
          className="
            w-full
            h-72
            object-cover
          "
        />

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
                {product.purchased_at
                  ? new Date(
                      product.purchased_at
                    ).toLocaleDateString(
                      "pt-BR"
                    )
                  : "-"}
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