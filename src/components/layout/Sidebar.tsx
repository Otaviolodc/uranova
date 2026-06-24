"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MenuItem = {
  icon: string;
  name: string;
  href: string;
};

export default function Sidebar() {

  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);
  
  const [collapsed, setCollapsed] =
    useState(false);

  const menu: MenuItem[] = [
  { icon: "🏠", name: "Dashboard", href: "/dashboard" },
  { icon: "🔗", name: "Links", href: "/dashboard/links" },
  { icon: "📦", name: "Produtos", href: "/dashboard/products" },
  { icon: "💳", name: "Checkouts", href: "/dashboard/checkouts" },
  { icon: "📈", name: "Analytics IA", href: "/dashboard/analytics" },
  { icon: "🛒", name: "Marketplace", href: "/dashboard/marketplace" },
  { icon: "👥", name: "Clientes", href: "/dashboard/customers" },
  { icon: "📋", name: "Pedidos", href: "/dashboard/orders" },
  { icon: "💰", name: "Financeiro", href: "/dashboard/finance" },
  { icon: "🎨", name: "Editar Perfil", href: "/dashboard/settings" },
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
        Uranova
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
            <>
              <span className="text-xl">
                {item.icon}
              </span>

              <span className="ml-3">
                {item.name}
              </span>
            </>
          </Link>

        ))}

      </nav>

      </div>
    )}

    <aside
      className={`
        hidden
        md:flex
        ${collapsed ? "w-24" : "w-72"}
        min-h-screen
        bg-zinc-950/90
        backdrop-blur-xl
        border-r
        border-zinc-800
        p-5
        flex-col
        gap-6
        transition-all
        duration-300
      `}
    >
    
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        p-3
        text-white
        mb-6
        hover:border-green-500
        transition
      "
    >
      ☰
    </button>

      <div className="mb-10">

        <h1
          className="
            text-3xl
            font-black
            bg-gradient-to-r
            from-green-400
            to-emerald-600
            bg-clip-text
            text-transparent
          "
        >
          {collapsed ? "U" : "Uranova"}
        </h1>

        {!collapsed && (
          <p className="text-zinc-500 text-sm mt-1">
            IA Marketing Platform
          </p>
        )}

      </div>

      <nav className="flex flex-col gap-3">

        {menu.map((item) => (

          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            title={item.name}
            className={`
              flex
              items-center
              ${collapsed ? "justify-center" : "gap-3"}
              px-5
              py-4
              rounded-2xl
              border
              transition-all 
              duration-200
              
              ${
                pathname === item.href ||
                (
                  item.href !== "/dashboard" &&
                  pathname.startsWith(item.href)
                )
                  ? "bg-green-500 text-black border-green-400 shadow-[0_0_25px_rgba(34,197,94,0.45)]"
                  : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:border-green-500/30"
              }
            `}
          >         
              <span>{item.icon}</span>

            {!collapsed && (
              <span>{item.name}</span>
            )}
              
          </Link>

        ))}

      </nav>

    </aside>

  </>
);

}