"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Product = {
  id: string;
  title: string;
  image_url: string | null;
  description: string | null;
  type: string | null;
  unlocked_at?: string;
};

const categories = [
  { value: "all", label: "Todos" },
  { value: "course", label: "Cursos" },
  { value: "ebook", label: "E-books" },
  { value: "pdf", label: "PDFs" },
  { value: "mentoring", label: "Mentorias" },
  { value: "bundle", label: "Packs de Arquivos" },
];

const typeLabels: Record<string, string> = {
  course: "Curso",
  ebook: "E-book",
  pdf: "PDF",
  mentoring: "Mentoria",
  bundle: "Pack de Arquivos",
};

function getProductTypeLabel(type: string | null) {
  if (!type) return "Produto digital";

  return typeLabels[type] || "Produto digital";
}

function getProductActionLabel(type: string | null) {
  switch (type) {
    case "course":
      return "Acessar Curso";

    case "ebook":
      return "Abrir E-book";

    case "pdf":
      return "Abrir PDF";

    case "mentoring":
      return "Acessar Mentoria";

    case "bundle":
      return "Acessar Arquivos";

    default:
      return "Abrir Produto";
  }
}

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const {
      data: customerProducts,
      error: customerError,
    } = await supabase
      .from("customer_products")
      .select("*")
      .eq("customer_id", user.id);

    if (customerError) {
      console.error(
        "Erro ao buscar produtos do cliente:",
        customerError
      );

      setLoading(false);
      return;
    }

    if (!customerProducts?.length) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const productIds = customerProducts.map(
      (item) => item.product_id
    );

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(`
        id,
        title,
        image_url,
        type
      `)
      .in("id", productIds);

    if (error) {
      console.error(
        "Erro ao buscar produtos:",
        error
      );

      setLoading(false);
      return;
    }

    const formattedProducts: Product[] =
      (data || []).map((product) => {
        const customerProduct =
          customerProducts.find(
            (item) =>
              item.product_id === product.id
          );

        return {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          type: product.type,
          description: null,
          unlocked_at:
            customerProduct?.unlocked_at,
        };
      });

    setProducts(formattedProducts);
    setLoading(false);
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.title
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        category === "all" ||
        product.type === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [products, search, category]);

  const productCount = products.length;

  const filteredCount =
    filteredProducts.length;

  return (
    <div className="min-h-screen">

      {/* ==========================================================
          HEADER
      ========================================================== */}

      <div className="mb-10">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div
              className="
                inline-flex
                items-center
                rounded-full
                bg-green-500/10
                border
                border-green-500/20
                px-4
                py-2
                text-sm
                font-semibold
                text-green-400
                mb-4
              "
            >
              Biblioteca digital
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Meus Produtos
            </h1>

            <p className="text-zinc-400 mt-3 text-base md:text-lg">
              Acesse todos os produtos liberados
              para sua conta.
            </p>

          </div>

          <div
            className="
              flex
              items-center
              gap-3
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              px-5
              py-4
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-green-500/10
                text-green-400
                font-black
              "
            >
              {productCount}
            </div>

            <div>

              <p className="text-sm font-bold text-white">
                {productCount === 1
                  ? "Produto disponível"
                  : "Produtos disponíveis"}
              </p>

              <p className="text-xs text-zinc-500 mt-1">
                Na sua biblioteca
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================================
          BUSCA + FILTROS
      ========================================================== */}

      {products.length > 0 && (

        <div className="mb-10">

          <div className="flex flex-col xl:flex-row gap-4">

            {/* BUSCA */}

            <div className="relative flex-1">

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  left-0
                  flex
                  items-center
                  pl-5
                  text-zinc-500
                "
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                  />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Buscar nos meus produtos..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-900
                  px-5
                  py-4
                  pl-13
                  text-white
                  placeholder:text-zinc-600
                  outline-none
                  transition
                  focus:border-green-500/50
                  focus:ring-2
                  focus:ring-green-500/10
                "
              />

            </div>

            {/* CONTADOR */}

            <div
              className="
                flex
                items-center
                justify-center
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-900
                px-5
                py-4
                text-sm
                text-zinc-400
                whitespace-nowrap
              "
            >
              <span className="font-bold text-white">
                {filteredCount}
              </span>

              <span className="ml-1">
                {filteredCount === 1
                  ? "produto"
                  : "produtos"}
              </span>
            </div>

          </div>

          {/* CATEGORIAS */}

          <div className="flex gap-3 overflow-x-auto pb-2 mt-5">

            {categories.map((item) => {

              const active =
                category === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setCategory(item.value)
                  }
                  className={`
                    shrink-0
                    rounded-xl
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all
                    ${
                      active
                        ? "bg-green-500 text-black shadow-lg shadow-green-500/10"
                        : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white"
                    }
                  `}
                >
                  {item.label}
                </button>
              );
            })}

          </div>

        </div>

      )}

      {/* ==========================================================
          LOADING
      ========================================================== */}

      {loading && (

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-7
          "
        >

          {[1, 2, 3].map((item) => (

            <div
              key={item}
              className="
                overflow-hidden
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-900
                animate-pulse
              "
            >

              <div className="h-56 bg-zinc-800" />

              <div className="p-6">

                <div className="h-6 w-2/3 bg-zinc-800 rounded-lg" />

                <div className="h-4 w-1/3 bg-zinc-800 rounded-lg mt-4" />

                <div className="h-12 w-full bg-zinc-800 rounded-2xl mt-7" />

              </div>

            </div>

          ))}

        </div>

      )}

      {/* ==========================================================
          PRODUTOS
      ========================================================== */}

      {!loading && filteredProducts.length > 0 && (

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-7
          "
        >

          {filteredProducts.map((product) => (

            <div
              key={product.id}
              className="
                group
                overflow-hidden
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-900
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-green-500/30
                hover:shadow-2xl
                hover:shadow-black/30
              "
            >

              {/* IMAGEM */}

              <div className="relative h-56 overflow-hidden bg-zinc-950">

                <img
                  src={
                    product.image_url ||
                    "/placeholder.png"
                  }
                  alt={product.title}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-105
                  "
                />

                {/* GRADIENT */}

                <div
                  className="
                    absolute
                    inset-x-0
                    bottom-0
                    h-24
                    bg-gradient-to-t
                    from-black/70
                    to-transparent
                    pointer-events-none
                  "
                />

                {/* TIPO */}

                <div
                  className="
                    absolute
                    top-4
                    left-4
                    rounded-full
                    border
                    border-white/10
                    bg-black/70
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-white
                    backdrop-blur-md
                  "
                >
                  {getProductTypeLabel(
                    product.type
                  )}
                </div>

                {/* STATUS */}

                <div
                  className="
                    absolute
                    top-4
                    right-4
                    rounded-full
                    bg-green-500
                    px-3
                    py-1.5
                    text-xs
                    font-black
                    text-black
                    shadow-lg
                    shadow-green-500/20
                  "
                >
                  LIBERADO
                </div>

              </div>

              {/* CONTEÚDO */}

              <div className="p-6">

                <div className="min-h-[76px]">

                  <h2
                    className="
                      text-xl
                      md:text-2xl
                      font-black
                      leading-tight
                      text-white
                      line-clamp-2
                    "
                  >
                    {product.title}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    {getProductTypeLabel(
                      product.type
                    )}
                  </p>

                </div>

                {/* INFORMAÇÕES */}

                <div
                  className="
                    mt-5
                    space-y-3
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-black/20
                    p-4
                  "
                >

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-zinc-500">
                      Status
                    </span>

                    <span className="text-sm font-bold text-green-400">
                      Liberado
                    </span>

                  </div>

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-zinc-500">
                      Aquisição
                    </span>

                    <span className="text-sm font-medium text-zinc-300">
                      {product.unlocked_at
                        ? new Date(
                            product.unlocked_at
                          ).toLocaleDateString(
                            "pt-BR"
                          )
                        : "-"}
                    </span>

                  </div>

                </div>

                {/* BOTÃO */}

                <Link
                  href={
                    product.type === "course"
                      ? `/dashboard/my-courses/${product.id}`
                      : `/dashboard/customer/products/${product.id}`
                  }
                  className="
                    mt-5
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-green-500
                    px-5
                    py-3.5
                    text-center
                    font-black
                    text-black
                    transition-all
                    duration-300
                    hover:bg-green-400
                    hover:shadow-lg
                    hover:shadow-green-500/10
                  "
                >
                  {getProductActionLabel(
                    product.type
                  )}

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* ==========================================================
          NENHUM PRODUTO
      ========================================================== */}

      {!loading &&
        products.length === 0 && (

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-900
              px-6
              py-20
              text-center
            "
          >

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
              "
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-500"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>

            <h2 className="mt-6 text-2xl font-black text-white">
              Sua biblioteca está vazia
            </h2>

            <p className="mx-auto mt-3 max-w-md text-zinc-500">
              Quando você comprar um produto,
              ele aparecerá automaticamente
              nesta área.
            </p>

            <Link
              href="/dashboard/marketplace"
              className="
                mt-7
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-green-500
                px-6
                py-3
                font-bold
                text-black
                transition
                hover:bg-green-400
              "
            >
              Explorar Marketplace

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </Link>

          </div>

        )}

      {/* ==========================================================
          FILTRO SEM RESULTADOS
      ========================================================== */}

      {!loading &&
        products.length > 0 &&
        filteredProducts.length === 0 && (

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-900
              px-6
              py-16
              text-center
            "
          >

            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-zinc-950
                border
                border-zinc-800
              "
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-500"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-black text-white">
              Nenhum produto encontrado
            </h2>

            <p className="mt-2 text-zinc-500">
              Tente buscar por outro nome
              ou alterar o filtro.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              className="
                mt-6
                rounded-xl
                border
                border-zinc-700
                bg-zinc-800
                px-5
                py-2.5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-zinc-700
              "
            >
              Limpar filtros
            </button>

          </div>

        )}

    </div>
  );
}