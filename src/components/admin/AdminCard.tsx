type AdminCardProps = {
  icon: string;
  title: string;
  value: string | number;
  valueColor?: string;
};

export default function AdminCard({
  icon,
  title,
  value,
  valueColor = "text-white",
}: AdminCardProps) {
  return (
    <div
      className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
        transition-all
        duration-200
        hover:border-green-500/40
        hover:-translate-y-1
      "
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>

        <p className="text-zinc-400 font-medium">
          {title}
        </p>
      </div>

      <h2 className={`text-5xl font-black ${valueColor}`}>
        {value}
      </h2>
    </div>
  );
}