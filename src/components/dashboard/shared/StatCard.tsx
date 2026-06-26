import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: "green" | "blue" | "purple" | "yellow" | "red";
};

const colors = {
  green: "border-green-500/30",
  blue: "border-blue-500/30",
  purple: "border-purple-500/30",
  yellow: "border-yellow-500/30",
  red: "border-red-500/30",
};

export default function StatCard({
  title,
  value,
  icon,
  color = "green",
}: StatCardProps) {
  return (
    <div
      className={`
        bg-zinc-900
        border
        rounded-3xl
        p-6
        transition
        hover:scale-[1.02]
        ${colors[color]}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-400 font-medium">
          {title}
        </h3>

        {icon && (
          <div className="text-2xl">
            {icon}
          </div>
        )}
      </div>

      <p className="text-4xl font-black text-white">
        {value}
      </p>
    </div>
  );
}