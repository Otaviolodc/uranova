import { getFinancialHistory } from "@/lib/services/financial";

interface FinancialHistoryProps {
  userId: string;
}

function getTransactionType(type: string) {
  switch (type) {
    case "sale":
      return {
        label: "Venda",
        color: "text-green-400",
      };

    case "withdraw":
      return {
        label: "Saque",
        color: "text-yellow-400",
      };

    case "refund":
      return {
        label: "Reembolso",
        color: "text-red-400",
      };

    case "adjustment":
      return {
        label: "Ajuste",
        color: "text-blue-400",
      };

    default:
      return {
        label: type,
        color: "text-zinc-400",
      };
  }
}

export default async function FinancialHistory({
  userId,
}: FinancialHistoryProps) {
  const transactions = await getFinancialHistory(userId);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-2xl font-bold text-white">
          Histórico Financeiro
        </h2>
      </div>

      <table className="w-full">
        <thead className="border-b border-zinc-800 text-zinc-400">
          <tr>
            <th className="p-5 text-left">
              Data
            </th>

            <th className="p-5 text-left">
              Tipo
            </th>

            <th className="p-5 text-left">
              Descrição
            </th>

            <th className="p-5 text-left">
              Valor
            </th>
          </tr>
        </thead>

        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="p-6 text-center text-zinc-500"
              >
                Nenhuma movimentação financeira.
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => {
              const transactionType = getTransactionType(
                transaction.type
              );

              return (
                <tr
                  key={transaction.id}
                  className="border-b border-zinc-800"
                >
                  <td className="p-5">
                    {new Date(
                      transaction.created_at
                    ).toLocaleDateString("pt-BR")}
                  </td>

                  <td
                    className={`p-5 font-semibold ${transactionType.color}`}
                  >
                    {transactionType.label}
                  </td>

                  <td className="p-5">
                    {transaction.description}
                  </td>

                  <td
                    className={`p-5 font-semibold ${
                      transaction.amount >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {transaction.amount.toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      }
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}