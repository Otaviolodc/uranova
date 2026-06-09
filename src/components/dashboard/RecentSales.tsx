const sales = [
  {
    id: 1,
    customer: "João Silva",
    product: "Curso Dropshipping",
    value: "R$ 97",
    status: "Pago",
  },
  {
    id: 2,
    customer: "Maria Souza",
    product: "Ebook Marketing",
    value: "R$ 49",
    status: "Pago",
  },
  {
    id: 3,
    customer: "Pedro Lima",
    product: "Mentoria Premium",
    value: "R$ 297",
    status: "Pago",
  },
];

export default function RecentSales() {
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
        🧾 Últimas Vendas
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b border-zinc-800">

              <th className="text-left py-3 text-zinc-400">
                Cliente
              </th>

              <th className="text-left py-3 text-zinc-400">
                Produto
              </th>

              <th className="text-left py-3 text-zinc-400">
                Valor
              </th>

              <th className="text-left py-3 text-zinc-400">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {sales.map((sale) => (

              <tr
                key={sale.id}
                className="
                  border-b
                  border-zinc-800
                "
              >

                <td className="py-4 text-white">
                  {sale.customer}
                </td>

                <td className="py-4 text-white">
                  {sale.product}
                </td>

                <td className="py-4 text-green-400 font-semibold">
                  {sale.value}
                </td>

                <td className="py-4">

                  <span
                    className="
                      bg-green-500/20
                      text-green-400
                      px-3
                      py-1
                      rounded-full
                      text-sm
                    "
                  >
                    {sale.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}