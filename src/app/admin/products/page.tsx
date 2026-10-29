import { requireAdminPage } from "@/lib/security/admin-page";
import Link from "next/link";
import { getAdminProductCatalog } from "@/lib/services/admin-products";

export default async function ProductsPage() {
  await requireAdminPage();
  const catalog = await getAdminProductCatalog();
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Produtos</h1>
          <p className="mt-2 text-zinc-400">Cadastros atuais e históricos, com sua situação comercial.</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2">
          Total: {catalog ? catalog.counts.registered : "Indisponível"}
        </div>
      </div>
      {!catalog ? (
        <div role="alert" className="rounded-2xl border border-amber-500/30 bg-zinc-900 p-6">
          <p>Não foi possível consultar os produtos e sua situação comercial.</p>
          <Link href="/admin/products" className="mt-4 inline-block rounded-xl bg-green-500 px-4 py-3 font-semibold text-black hover:bg-green-400">Tentar novamente</Link>
        </div>
      ) : catalog.products.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">Nenhum produto cadastrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <caption className="sr-only">Produtos cadastrados e situação comercial derivada dos checkouts</caption>
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>{["Produto", "Proprietário", "Preço cadastrado", "Tipo", "Cadastro", "Situação comercial", "Ações"].map(label => <th scope="col" key={label} className="p-5 font-medium">{label}</th>)}</tr>
            </thead>
            <tbody>
              {catalog.products.map(product => {
                const price = product.price?.trim() ? Number(product.price) : NaN;
                const created = product.created_at ? new Date(product.created_at) : null;
                const published = product.commercialStatus === "Publicado no Marketplace";
                return (
                  <tr key={product.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40">
                    <td className="max-w-64 break-words p-5 font-medium">{product.title || "Sem título"}</td>
                    <td className="max-w-56 break-words p-5 text-zinc-300">
                      {product.owner?.name || product.owner?.username || "Nome indisponível"}
                      {product.owner?.username && <span className="mt-1 block text-xs text-zinc-400">@{product.owner.username}</span>}
                      <span className="mt-1 block break-all text-xs text-zinc-500">{product.user_id || "Proprietário não informado"}</span>
                    </td>
                    <td className="whitespace-nowrap p-5 text-zinc-300">{Number.isFinite(price) ? price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Indisponível"}</td>
                    <td className="p-5">{product.type || "—"}</td>
                    <td className="whitespace-nowrap p-5 text-zinc-400">{created && !Number.isNaN(created.getTime()) ? created.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—"}</td>
                    <td className="p-5"><span className={`inline-block rounded-full border px-3 py-2 text-xs font-medium ${published ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-zinc-700 bg-zinc-950 text-zinc-300"}`}>{product.commercialStatus}</span></td>
                    <td className="p-5"><Link href={`/admin/products/${product.id}`} className="inline-block rounded-lg bg-green-500 px-3 py-2 font-semibold text-black hover:bg-green-400">Visualizar</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-sm text-zinc-500">A situação comercial reflete os checkouts atuais. Produtos sem checkout permanecem disponíveis para consulta administrativa; isso não indica exclusão ou arquivamento.</p>
    </div>
  );
}
