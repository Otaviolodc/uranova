"use client";

import AchievementProgress from "@/components/dashboard/AchievementProgress";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type MenuItem = {
  icon: string;
  name: string;
  href: string;
};

interface SidebarProps {
  userId: string;
  totalEarned: number;
}

export default function Sidebar({
  totalEarned,
}: SidebarProps) {

  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  const creatorMenu: MenuItem[] = [
    {
      icon: "🏠",
      name: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: "🔗",
      name: "Links",
      href: "/dashboard/links",
    },
    {
      icon: "📦",
      name: "Produtos",
      href: "/dashboard/products",
    },
    {
      icon: "💳",
      name: "Checkouts",
      href: "/dashboard/checkouts",
    },
    {
      icon: "🛒",
      name: "Marketplace",
      href: "/dashboard/marketplace",
    },
    {
      icon: "👥",
      name: "Clientes",
      href: "/dashboard/customers",
    },
    {
      icon: "📋",
      name: "Pedidos",
      href: "/dashboard/orders",
    },
    {
      icon: "💰",
      name: "Financeiro",
      href: "/dashboard/finance",
    },
    {
      icon: "📈",
      name: "Analytics",
      href: "/dashboard/analytics",
    },
    {
      icon: "🏆",
      name: "Conquistas",
      href: "/dashboard/achievements",
    },
  ];

  const customerMenu: MenuItem[] = [
    {
      icon: "📚",
      name: "Meus Produtos",
      href: "/dashboard/customer/products",
    },
    {
      icon: "🧾",
      name: "Minhas Compras",
      href: "/dashboard/customer/purchases",
    },
    {
      icon: "⬇️",
      name: "Downloads",
      href: "/dashboard/customer/downloads",
    },
  ];

  const customizationMenu: MenuItem[] = [
    {
      icon: "🎨",
      name: "Aparência",
      href: "/dashboard/settings",
    },
  ];


  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setMobileOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [mobileOpen]);

  function navigation(compact: boolean) {
    return (
      <nav aria-label="Navegação do painel" className="flex flex-col gap-3">
        {[
          { title: "CRIADOR", items: creatorMenu },
          { title: "CLIENTE", items: customerMenu },
          { title: "PERSONALIZAÇÃO", items: customizationMenu },
        ].map((group, index) => (
          <div key={group.title} className="flex flex-col gap-3">
            {!compact && <p className={index ? "mt-5 border-t border-zinc-800 pt-5 text-xs font-bold tracking-widest text-green-400" : "mb-2 text-xs font-bold tracking-widest text-green-400"}>{group.title}</p>}
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return <Link key={item.href} href={item.href} prefetch={true} title={item.name}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={"flex items-center " + (compact ? "justify-center" : "gap-3") + " px-5 py-3 rounded-2xl border transition-all duration-200 " + (active ? "bg-green-500 text-black border-green-400 shadow-[0_0_25px_rgba(34,197,94,0.45)]" : "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:border-green-500/30")}>
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                {!compact && <span>{item.name}</span>}
              </Link>;
            })}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <>
      <div className="mobile-navigation-bar lg:hidden fixed top-0 left-0 right-0 z-[70] bg-zinc-950 border-b border-zinc-800 px-4 py-4 flex items-center justify-between">
        <h2 className="font-bold text-white">Uranova</h2>
        <button ref={triggerRef} type="button" onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu" aria-expanded={mobileOpen} aria-controls="mobile-navigation"
          className="h-11 w-11 text-2xl text-white">☰</button>
      </div>
      <dialog ref={dialogRef} id="mobile-navigation" aria-label="Menu Uranova"
        onCancel={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)}
        className="m-0 h-dvh max-h-dvh w-full max-w-full border-0 bg-zinc-950 p-4 text-white backdrop:bg-black/70">
        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-zinc-950 pt-[env(safe-area-inset-top)]">
          <h2 className="font-bold">Uranova</h2>
          <button type="button" autoFocus onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="h-11 w-11 text-2xl">×</button>
        </div>
        <div className="pb-[max(2rem,env(safe-area-inset-bottom))]">{navigation(false)}</div>
      </dialog>
      <aside className={"hidden lg:flex " + (collapsed ? "w-24" : "w-72") + " shrink-0 min-h-screen bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800 p-5 flex-col gap-6 transition-all duration-300"}>
        <button type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-white mb-6 hover:border-green-500 transition">☰</button>
        {!collapsed && <div className="mb-4"><AchievementProgress totalEarned={totalEarned} /></div>}
        {navigation(collapsed)}
      </aside>
    </>
  );
}
