import { getWithdrawRequests } from "@/lib/services/adminWithdraw";
import WithdrawRow from "./WithdrawRow";

export default async function WithdrawTable() {
  const withdraws = await getWithdrawRequests();

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 text-left">
            <th className="p-4">Produtor</th>
            <th className="p-4">Data</th>
            <th className="p-4">Valor</th>
            <th className="p-4">Tipo PIX</th>
            <th className="p-4">Chave PIX</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Ações</th>
          </tr>
        </thead>

        <tbody>
          {withdraws.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="p-6 text-center text-zinc-400"
              >
                Nenhuma solicitação encontrada.
              </td>
            </tr>
          ) : (
            withdraws.map((withdraw) => (
              <WithdrawRow
                key={withdraw.id}
                withdraw={withdraw}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}