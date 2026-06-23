import Link from "next/link";

type Action = {
  title: string;
  href: string;
};

export default function QuickActions() {

  const actions: Action[] = [
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
      href: "/dashboard/checkouts",
    },
    {
      title: "🎟 Novo Cupom",
      href: "/dashboard/coupons",
    },
  ];

  return (
    <div className="mt-10">

      <h2 className="text-2xl font-bold text-white mb-5">
        ⚡ Ações Rápidas
      </h2>

      <div className="
             grid
             grid-cols-1
             sm:grid-cols-2
             xl:grid-cols-4
             gap-4"
        >

        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-3xl
              p-6
              hover:border-green-500/30
              hover:bg-zinc-800
              hover:-translate-y-1
              duration-300
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