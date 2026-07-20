"use client";

import { useTransition } from "react";

import {
  approveWithdrawAction,
  rejectWithdrawAction,
  markWithdrawAsPaidAction,
} from "@/app/admin/withdraws/actions";

interface WithdrawActionsProps {
  withdrawId: string;
  status: string;
}

export default function WithdrawActions({
  withdrawId,
  status,
}: WithdrawActionsProps) {
  const [isPending, startTransition] = useTransition();

  // Saque pendente
if (status === "pending") {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={() =>
          startTransition(async () => {
            await approveWithdrawAction(withdrawId);
          })
        }
        disabled={isPending}
        className="
          rounded-lg
          bg-green-600
          px-3
          py-1.5
          text-sm
          font-medium
          text-white
          transition
          hover:bg-green-500
          disabled:opacity-50
        "
      >
        {isPending ? "Processando..." : "Aprovar"}
      </button>

      <button
        onClick={() =>
          startTransition(async () => {
            await rejectWithdrawAction(withdrawId);
          })
        }
        disabled={isPending}
        className="
          rounded-lg
          bg-red-600
          px-3
          py-1.5
          text-sm
          font-medium
          text-white
          transition
          hover:bg-red-500
          disabled:opacity-50
        "
      >
        {isPending ? "Processando..." : "Recusar"}
      </button>
    </div>
  );
}

// Saque aprovado
if (status === "approved") {
  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await markWithdrawAsPaidAction(withdrawId);
        })
      }
      disabled={isPending}
      className="
        rounded-lg
        bg-blue-600
        px-3
        py-1.5
        text-sm
        font-medium
        text-white
        transition
        hover:bg-blue-500
        disabled:opacity-50
      "
    >
      {isPending ? "Processando..." : "Marcar como Pago"}
    </button>
  );
}

// Pago ou recusado
return <span className="text-zinc-500">—</span>;

}