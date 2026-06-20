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
        relative
        overflow-hidden
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
        hover:border-green-500/30
        hover:-translate-y-1
        transition-all
        duration-300
      "
    >
      <div
        className="
          absolute
          top-0
          right-0
          w-32
          h-32
          bg-green-500/10
          blur-3xl
        "
      />

      <p className="text-zinc-400 text-sm">
        {title}
      </p>

      <h2
        className="
          text-4xl
          font-black
          mt-4
          text-white
        "
      >
        {value}
      </h2>

      {subtitle && (
        <p
          className="
            text-green-400
            text-sm
            mt-3
            font-medium
          "
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}