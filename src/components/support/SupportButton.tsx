"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import SupportPanel from "./SupportPanel";

export default function SupportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SupportPanel
        open={open}
        onClose={() => setOpen(false)}
      />

      <button
        onClick={() => setOpen(!open)}
        title="Central de Ajuda"
        className="
          fixed
          bottom-6
          right-6
          z-50

          flex
          items-center
          justify-center

          w-16
          h-16

          rounded-full

          bg-emerald-600

          hover:bg-emerald-500

          text-white

          shadow-2xl

          transition-all

          duration-300

          hover:scale-110
        "
      >
        <MessageCircle size={30} />
      </button>
    </>
  );
}