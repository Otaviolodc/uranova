const products = [
  {
    position: "🥇",
    name: "Curso Dropshipping",
    sales: 128,
  },
  {
    position: "🥈",
    name: "Ebook Marketing",
    sales: 94,
  },
  {
    position: "🥉",
    name: "Mentoria Premium",
    sales: 61,
  },
];

export default function TopProducts() {
  return (
    <div
      className="
        mt-10
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
      "
    >
      <h2 className="text-2xl font-bold text-white mb-6">
        🔥 Produtos Mais Vendidos
      </h2>

      <div className="space-y-4">

        {products.map((product) => (

          <div
            key={product.name}
            className="
              flex
              items-center
              justify-between
              bg-black
              border
              border-zinc-800
              rounded-2xl
              p-4
            "
          >

            <div className="flex items-center gap-4">

              <span className="text-3xl">
                {product.position}
              </span>

              <div>

                <h3 className="text-white font-semibold">
                  {product.name}
                </h3>

                <p className="text-zinc-400 text-sm">
                  {product.sales} vendas
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}