interface Props {
  products: any[];
}

export default function ProductStats({
  products,
}: Props) {
  return (
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
  );
}