interface StatusBadgeProps {
  status: string;
}

const statusMap = {
  pending: {
    label: "Pendente",
    className:
      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  },
  approved: {
    label: "Aprovado",
    className:
      "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  paid: {
    label: "Pago",
    className:
      "bg-green-500/10 text-green-400 border border-green-500/20",
  },
  rejected: {
    label: "Recusado",
    className:
      "bg-red-500/10 text-red-400 border border-red-500/20",
  },
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const badge =
    statusMap[status as keyof typeof statusMap];

  if (!badge) {
    return (
      <span className="text-zinc-400">
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}