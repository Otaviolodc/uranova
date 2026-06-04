"use client";

import { supabase }
from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {

  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const menu = [
  {
    name: "Links",
    href: "/dashboard/links",
  },
  {
    name: "Perfil",
    href: "/dashboard/profile",
  },
  {
    name: "Analytics IA",
    href: "/dashboard/analytics",
  },
  {
    name: "Criar Produtos",
    href: "/dashboard/store",
  },
  {
    name: "Marketplace",
    href: "/marketplace",
  },
  {
    name: "Upgrade PRO",
    href: "/pricing",
  },
];

  return (
  <>

    {/* TOPO MOBILE */}
    <div
      className="
        md:hidden
        fixed
        top-0
        left-0
        right-0
        z-50
        bg-zinc-950
        border-b
        border-zinc-800
        px-4
        py-4
        flex
        items-center
        justify-between
      "
    >
      <h2 className="font-bold text-white">
        PromoLink
      </h2>

      <button
        onClick={() =>
          setMobileOpen(!mobileOpen)
        }
        className="text-2xl text-white"
      >
        ☰
      </button>

    </div>

    {mobileOpen && (
      <div
        className="
          md:hidden
          fixed
          inset-0
          z-40
          bg-black/95
          pt-20
          px-4
        "
      >
        <nav className="flex flex-col gap-3">

        {menu.map((item) => (

          <Link
            key={item.href}
            href={item.href}
            onClick={() =>
              setMobileOpen(false)
            }
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              px-5
              py-4
              text-white
            "
          >
            {item.name}
          </Link>

        ))}

      </nav>

      <Link
        href="/login"
        prefetch={true}
        className="
          mt-10
          bg-red-500
          hover:bg-red-400
          transition
          text-white
          py-4
          rounded-2xl
          font-bold
          w-full
          text-center
          block
        "
            >
        Sair da conta
      </Link>

      </div>
    )}

    <aside
      className="
        hidden
        md:flex
        w-72
        min-h-screen
        bg-zinc-950/90
        backdrop-blur-xl
        border-r
        border-zinc-800
        p-5
        flex-col
        gap-6
      "
    >

      <div className="mb-10">

        <Image
          src="/logo.png"
          alt=""
          width={60}
          height={60}
          className="rounded-2xl"
        />

        <p className="text-zinc-500 text-sm mt-1">
          IA Marketing Platform
        </p>

      </div>

      <nav className="flex flex-col gap-3">

        {menu.map((item) => (

          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={`
              flex
              items-center
              gap-3
              px-5
              py-4
              rounded-2xl
              transition-all
              duration-300
              font-medium
              border

              ${
                pathname === item.href
                  ? "bg-green-500 text-black border-green-400 shadow-[0_0_25px_rgba(34,197,94,0.45)]"
                  : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:border-green-500/30"
              }
            `}
          >
            {item.name}
          </Link>

        ))}

      </nav>

      <Link
        href="/login"
        prefetch={true}
        className="
          mt-10
          bg-red-500
          hover:bg-red-400
          transition
          text-white
          py-4
          rounded-2xl
          font-bold
          w-full
          text-center
          block
        "
      >
        Sair da conta
      </Link>

    </aside>

  </>
);

}