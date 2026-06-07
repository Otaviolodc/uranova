"use client";

import { supabase }
from "@/lib/supabase/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // 🚪 logout
  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.push("/login");
  };

  const menu = [

    {
      name: "Financeiro",
      href: "/dashboard/home",
    },

    {
      name: "Links",
      href: "/dashboard/links",
    },
    {
      name: "Perfil",
      href: "/dashboard/profile",
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
    },
    {
      name: "Upgrade PRO",
      href: "/pricing",
    },
  ];

  return (
    <aside className="w-64 bg-black border-r border-zinc-900 min-h-screen p-5">

      {/* LOGO */}
      <div className="mb-10 flex justify-center">

        <img
          src="/placeholder.png"
          alt="Uranova"
          className="w-44 object-contain"
        />

      </div>

      {/* MENU */}
      <div className="space-y-2">

        {menu.map((item) => {
          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-xl transition ${
                active
                  ? "bg-green-500 text-black font-semibold"
                  : "text-white hover:bg-zinc-900"
              }`}
            >
              {item.name}
            </Link>
          );
        })}

      </div>

      {/* LOGOUT */}
      <div className="mt-10">

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-400 transition text-black font-semibold py-3 rounded-xl"
        >
          Sair da conta
        </button>

      </div>

    </aside>
  );
}