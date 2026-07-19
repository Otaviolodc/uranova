import StatusBadge from "./StatusBadge";
import WithdrawActions from "./WithdrawActions";

interface WithdrawRowProps {
  withdraw: any;
}

export default function WithdrawRow({
  withdraw,
}: WithdrawRowProps) {
  return (
    <tr className="border-b border-zinc-800">
      {/* PRODUTOR */}
      <td className="p-4">
        <div className="flex flex-col">
          <span className="font-medium text-white">
            {withdraw.profile?.name ||
              withdraw.profile?.username ||
              "Sem nome"}
          </span>

          <span className="text-sm text-zinc-400">
            @{withdraw.profile?.username ?? "sem-username"}
          </span>
        </div>
      </td>

      {/* DATA */}
      <td className="p-4">
        {new Date(withdraw.created_at).toLocaleDateString("pt-BR")}
      </td>

      {/* VALOR */}
      <td className="p-4 font-medium text-green-400">
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(withdraw.amount)}
      </td>

      {/* TIPO PIX */}
      <td className="p-4">
        {{
          cpf: "CPF",
          email: "E-mail",
          phone: "Telefone",
          random: "Chave Aleatória",
          cnpj: "CNPJ",
        }[withdraw.pix_key_type] ?? withdraw.pix_key_type}
      </td>

      {/* CHAVE PIX */}
      <td className="p-4">
        {withdraw.pix_key}
      </td>

      {/* STATUS */}
      <td className="p-4">
        <StatusBadge status={withdraw.status} />
      </td>

      {/* AÇÕES */}
      <td className="p-4 text-right">
        <WithdrawActions />
      </td>
    </tr>
  );
}