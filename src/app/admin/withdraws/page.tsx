import WithdrawTable from "@/components/admin/withdraws/WithdrawTable";

export default function AdminWithdrawsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Solicitações de Saque
        </h1>

        <p className="text-zinc-400 mt-2">
          Gerencie todas as solicitações de saque dos produtores.
        </p>
      </div>

      <WithdrawTable />
    </div>
  );
}