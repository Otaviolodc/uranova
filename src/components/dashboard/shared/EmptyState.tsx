import { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="
        bg-zinc-900
        border
        border-dashed
        border-zinc-700
        rounded-3xl
        p-12
        flex
        flex-col
        items-center
        text-center
      "
    >
      {icon && (
        <div className="text-6xl mb-5">
          {icon}
        </div>
      )}

      <h2 className="text-2xl font-bold text-white">
        {title}
      </h2>

      <p className="text-zinc-400 mt-3 max-w-md">
        {description}
      </p>

      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </div>
  );
}