"use client";

import { useState } from "react";

export default function AdminNavigation({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" aria-expanded={open} aria-controls="admin-navigation"
      onClick={() => setOpen(!open)}
      className="min-h-11 w-full rounded-xl border border-zinc-800 px-4 py-3 text-left font-semibold lg:hidden">
      {open ? "Fechar menu administrativo" : "Abrir menu administrativo"}
    </button>
    <div id="admin-navigation" className={(open ? "block" : "hidden") + " mt-4 lg:mt-0 lg:flex lg:flex-1 lg:flex-col"}>
      {children}
    </div>
  </>;
}

