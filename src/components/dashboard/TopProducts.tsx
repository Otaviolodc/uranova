import { requireFinanceUser } from "@/lib/finance/access";
import { admin } from "@/lib/supabase/admin";
export default async function TopProducts() {
  const user = await requireFinanceUser();
  const { data: product, error } = await admin.rpc("finance_top_product", { p_user: user.id });
  if (error) throw new Error(error.message);
  const loading = false;
  return (
    <div
      className="
        mt-10
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        overflow-hidden
      "
    >
      {/* HEADER */}
      <div
        className="
          p-6
          border-b
          border-zinc-800
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          🏆 Produto mais vendido
        </h2>

        <p className="text-zinc-400 mt-2">
          Produto com maior número de vendas da sua operação
        </p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="p-10 text-center text-zinc-500">
          Carregando...
        </div>
      ) : !product ? (
        /* SEM VENDAS */
        <div className="py-16 text-center text-zinc-500">
          Nenhuma venda aprovada encontrada.
        </div>
      ) : (
        /* PRODUTO CAMPEÃO */
        <div className="p-6">
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-6
              bg-black
              border
              border-zinc-800
              rounded-3xl
              p-6
              hover:border-green-500/30
              transition-all
            "
          >
            {/* PRODUTO */}
            <div className="flex items-center gap-5">
              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-zinc-900
                  border
                  border-zinc-800
                  flex
                  items-center
                  justify-center
                  text-2xl
                "
              >
                🏆
              </div>

              <div>
                <p className="text-green-400 text-sm font-semibold">
                  Produto campeão de vendas
                </p>

                <h3
                  className="
                    text-white
                    font-bold
                    text-xl
                    mt-1
                  "
                >
                  {product.title}
                </h3>

                <p className="text-zinc-400 mt-1">
                  {product.type}
                </p>
              </div>
            </div>

            {/* RESULTADOS */}
            <div
              className="
                flex
                flex-wrap
                md:flex-nowrap
                gap-8
                md:text-right
              "
            >
              <div>
                <p className="text-zinc-500 text-sm">
                  Vendas
                </p>

                <p
                  className="
                    text-white
                    text-2xl
                    font-black
                    mt-1
                  "
                >
                  {product.sales}
                </p>
              </div>

              <div>
                <p className="text-zinc-500 text-sm">
                  Faturamento
                </p>

                <p
                  className="
                    text-green-400
                    text-2xl
                    font-black
                    mt-1
                  "
                >
                  {product.revenue.toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
