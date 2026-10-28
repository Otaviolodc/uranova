"use client";

import { useState } from "react";
import CatalogImage from "./CatalogImage";
import { matchesCatalogSearch, publicHttpUrl } from "@/lib/public-catalog";

export type StoreProduct = {
  id: string; title: string; price: number; image_url: string | null;
  affiliate_url: string | null; marketplace: string | null;
};

export default function StoreCatalog({ products, failed = false }: { products: StoreProduct[]; failed?: boolean }) {
  const [search, setSearch] = useState("");
  const [marketplace, setMarketplace] = useState("Todos");
  const filtered = products.filter((product) => matchesCatalogSearch(product.title, search)
    && (marketplace === "Todos" || product.marketplace?.trim().toLowerCase() === marketplace.toLowerCase()));

  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <input aria-label="Buscar produto na loja" placeholder="🔍 Buscar produto..." value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl px-6 py-5 text-lg mb-10" />
      <div className="flex gap-4 overflow-x-auto pb-6">
        {["Todos", "Shopee", "Amazon", "Hotmart", "Eduzz", "Braip"].map((item) => (
          <button key={item} onClick={() => setMarketplace(item)} aria-pressed={marketplace === item}
            className={`whitespace-nowrap px-6 py-3 rounded-2xl font-semibold ${marketplace === item ? "bg-green-500 text-black" : "bg-zinc-900"}`}>
            {item}
          </button>
        ))}
      </div>
      <h2 className="text-4xl font-black mt-8">🔥 Produtos Recomendados</h2>
      <p className="text-zinc-400 mt-2 mb-8">Produtos selecionados da loja</p>
      {failed ? (
        <p role="alert" className="text-center text-zinc-400 py-20">Não foi possível carregar os produtos. Atualize a página para tentar novamente.</p>
      ) : filtered.length === 0 ? (
        <p role="status" className="text-center text-zinc-400 py-20">{products.length ? "Nenhum produto corresponde aos filtros." : "Nenhum produto encontrado"}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => {
            const href = publicHttpUrl(product.affiliate_url);
            return (
              <article key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-green-500 transition-all">
                <CatalogImage src={product.image_url} alt={product.title} className="w-full h-72" />
                <div className="p-5">
                  <h3 className="font-bold text-xl line-clamp-2 min-h-[60px]">{product.title}</h3>
                  <p className="mt-4 text-4xl font-black text-green-400">R$ {product.price}</p>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="block mt-5 bg-green-500 hover:bg-green-400 text-black py-4 rounded-2xl font-black text-lg text-center">Comprar Agora</a>
                  ) : (
                    <p className="mt-5 py-4 text-center text-zinc-400">Link indisponível</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
