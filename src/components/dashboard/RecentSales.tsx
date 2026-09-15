import { requireFinanceUser } from "@/lib/finance/access";
import { admin } from "@/lib/supabase/admin";
export default async function RecentSales() {
  const user = await requireFinanceUser();
  const { data, error } = await admin.from("orders")
    .select("id,customer_name,amount,status,created_at,products(title)")
    .eq("user_id",user.id).not("stripe_payment_intent_id","is",null)
    .order("created_at",{ascending:false}).limit(10);
  if (error) throw new Error(error.message);
  const sales = data ?? [];
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
          🧾 Últimas Vendas
        </h2>

        <p className="text-zinc-400 mt-2">
          Pedidos mais recentes da sua operação
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className="
              border-b
              border-zinc-800
              bg-zinc-950
            "
          >
            <tr>
              <th className="text-left p-5 text-zinc-400">
                Produto
              </th>

              <th className="text-left p-5 text-zinc-400">
                Cliente
              </th>

              <th className="text-left p-5 text-zinc-400">
                Valor
              </th>

              <th className="text-left p-5 text-zinc-400">
                Status
              </th>

              <th className="text-left p-5 text-zinc-400">
                Data
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="
                    p-10
                    text-center
                    text-zinc-500
                  "
                >
                  Carregando vendas...
                </td>
              </tr>
            ) : (
              <>
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="
                      border-b
                      border-zinc-800
                      hover:bg-zinc-950
                      transition
                    "
                  >
                    <td className="p-5 text-white font-medium">
                      {sale.products?.[0]?.title || "Produto"}
                    </td>

                    <td className="p-5 text-white">
                      {sale.customer_name || "Cliente"}
                    </td>

                    <td
                      className="
                        p-5
                        text-green-400
                        font-bold
                      "
                    >
                      {Number(sale.amount).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )}
                    </td>

                    <td className="p-5">
                      <span
                        className="
                          text-white
                          text-sm
                          font-semibold
                          whitespace-nowrap
                        "
                      >
                        APROVADA
                      </span>
                    </td>

                    <td className="p-5 text-zinc-400">
                      {new Date(
                        sale.created_at
                      ).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}

                {sales.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="
                        p-10
                        text-center
                        text-zinc-500
                      "
                    >
                      Nenhuma venda encontrada.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
