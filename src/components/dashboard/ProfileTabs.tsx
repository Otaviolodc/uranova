"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileTabs() {

  const pathname = usePathname();

  const tabs = [
    {
      title: "👤 Meu Perfil",
      href: "/dashboard/profile",
    },
    {
      title: "⚙️ Configurações",
      href: "/dashboard/account",
    },
    {
      title: "🎨 Aparência",
      href: "/dashboard/settings",
    },
  ];

  return (

    <div className="
      mb-8
      bg-zinc-900
      border
      border-zinc-800
      rounded-3xl
      p-3
      flex
      flex-wrap
      gap-3
    ">

      {tabs.map((tab) => (

        <Link
          key={tab.href}
          href={tab.href}
          className={`
            px-5
            py-3
            rounded-2xl
            font-semibold
            transition-all
            ${
              pathname === tab.href
                ? "bg-green-500 text-black"
                : "bg-zinc-950 text-zinc-400 hover:bg-zinc-800"
            }
          `}
        >
          {tab.title}
        </Link>

      ))}

    </div>

  );
}