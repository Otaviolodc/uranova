import {
  Shield,
  BarChart3,
  Wallet,
  LifeBuoy,
  Cloud,
} from "lucide-react";

export default function TrustBar() {
  const items = [
    { icon: Shield, label: "Pagamentos Seguros" },
    { icon: Wallet, label: "PIX Instantâneo" },
    { icon: BarChart3, label: "Analytics" },
    { icon: LifeBuoy, label: "Suporte" },
    { icon: Cloud, label: "Nuvem" },
  ];

  return (
    <section className="border-y border-zinc-800 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-10">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 text-zinc-300"
          >
            <item.icon size={18} />
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
}