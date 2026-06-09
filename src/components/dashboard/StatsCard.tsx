interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
}: StatsCardProps) {
  return (
    <div
      className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
        hover:border-green-500/20
        transition-all
      "
    >
      <p className="text-zinc-400 text-sm">
        {title}
      </p>

      <h2 className="text-3xl font-black mt-3 text-white">
        {value}
      </h2>

      {subtitle && (
        <p className="text-green-400 text-sm mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}