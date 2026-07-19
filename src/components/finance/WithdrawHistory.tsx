import { getWithdrawHistory } from "@/lib/services/withdraw";

interface WithdrawHistoryProps {
  userId: string;
}

function getStatus(status: string) {
  switch (status) {
    case "pending":
      return (
        <span className="text-yellow-400 font-semibold">
          Pendente
        </span>
      );

    case "approved":
      return (
        <span className="text-blue-400 font-semibold">
          Aprovado
        </span>
      );

    case "paid":
      return (
        <span className="text-green-400 font-semibold">
          Pago
        </span>
      );

    case "rejected":
      return (
        <span className="text-red-400 font-semibold">
          Recusado
        </span>
      );

    default:
      return status;
  }
}

export default async function WithdrawHistory({
  userId,
}: WithdrawHistoryProps) {
  const history =
    await getWithdrawHistory(userId);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 mt-8">
      <div className="border-b border-zinc-800 p-6">
        <h2 className="text-2xl font-bold text-white">
          Histórico de Saques
        </h2>
      </div>

      {history.length === 0 ? (
        <p className="p-6 text-zinc-400">
          Nenhuma solicitação encontrada.
        </p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-zinc-400">
              <th className="p-4">Data</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Chave PIX</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {history.map((withdraw) => (
              <tr
                key={withdraw.id}
                className="border-b border-zinc-800"
              >
                <td className="p-4 text-white">
                  {new Date(
                    withdraw.created_at
                  ).toLocaleDateString("pt-BR")}
                </td>

                <td className="p-4 text-green-400">
                  R${" "}
                  {Number(withdraw.amount).toFixed(2)}
                </td>

                <td className="p-4 text-white">
                  {withdraw.pix_key}
                </td>

                <td className="p-4">
                  {getStatus(withdraw.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}