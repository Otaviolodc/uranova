import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      title: "🔗 Novo Link",
      href: "/dashboard/links",
    },
    {
      title: "📦 Novo Produto",
      href: "/dashboard/products",
    },
    {
      title: "💳 Novo Checkout",
      href: "/dashboard/products",
    },
    {
      title: "🎟 Novo Cupom",
      href: "/dashboard/products",
    },
  ];

  return (
    <div className="mt-10">

      <h2 className="text-2xl font-bold text-white mb-5">
        ⚡ Ações Rápidas
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-3xl
              p-6
              hover:border-green-500/30
              hover:bg-zinc-800
              transition-all
              text-white
              font-semibold
            "
          >
            {action.title}
          </Link>
        ))}

      </div>

    </div>
  );
}