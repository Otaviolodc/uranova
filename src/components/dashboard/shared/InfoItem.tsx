type InfoItemProps = {
  label: string;
  value: React.ReactNode;
};

export default function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-zinc-800 last:border-b-0">
      <span className="text-sm text-zinc-500">
        {label}
      </span>

      <span className="text-white font-semibold break-all">
        {value || "-"}
      </span>
    </div>
  );
}