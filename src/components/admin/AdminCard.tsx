type AdminCardProps = {
  icon: string;
  title: string;
  value: string | number;
  description?: string;
  valueColor?: string;
};

export default function AdminCard({
  icon,
  title,
  value,
  description,
  valueColor = "text-white",
}: AdminCardProps) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-green-500/40
        hover:shadow-[0_10px_40px_rgba(0,0,0,0.35)]
      "
    >
      {/* BRILHO */}
      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          bg-green-500/5
          blur-2xl
          transition-all
          duration-300
          group-hover:bg-green-500/10
        "
      />

      {/* HEADER */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-950
              text-xl
            "
          >
            {icon}
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-400">
              {title}
            </p>

            {description && (
              <p className="mt-1 text-xs text-zinc-600">
                {description}
              </p>
            )}
          </div>
        </div>

        <span
          className="
            h-2
            w-2
            rounded-full
            bg-green-500
            opacity-70
          "
        />
      </div>

      {/* VALUE */}
      <div className="relative mt-6">
        <h2
          className={`
            text-4xl
            font-black
            tracking-tight
            md:text-5xl
            ${valueColor}
          `}
        >
          {value}
        </h2>
      </div>
    </div>
  );
}