"use client";

import { ReactNode, useState } from "react";

interface LessonSectionProps {
  title: string;
  icon: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function LessonSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: LessonSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          w-full
          flex
          items-center
          justify-between
          px-4
          py-3
          hover:bg-zinc-900
          transition-colors
        "
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>

          <span className="font-semibold">
            {title}
          </span>
        </div>

        <span
          className={`
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="border-t border-zinc-800 p-5">
          {children}
        </div>
      )}
    </div>
  );
}