import { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

export default function SectionCard({
  title,
  description,
  children,
  action,
}: SectionCardProps) {
  return (
    <section
      className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
        shadow-sm
      "
    >
      {(title || action) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-white">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-zinc-400">
                {description}
              </p>
            )}
          </div>

          {action && action}
        </div>
      )}

      {children}
    </section>
  );
}