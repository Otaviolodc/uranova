import {
  Shield,
  CreditCard,
  BarChart3,
  Users,
} from "lucide-react";

export default function TrustBar() {
  return (
    <section className="border-y border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-10">

        <Item icon={<Shield size={18} />} text="Pagamentos Seguros" />

        <Item icon={<CreditCard size={18} />} text="Checkout Próprio" />

        <Item icon={<Users size={18} />} text="Área de Membros" />

        <Item icon={<BarChart3 size={18} />} text="Analytics" />

      </div>
    </section>
  );
}

function Item({
  icon,
  text,
}: any) {
  return (
    <div className="flex items-center gap-3 text-zinc-300">
      {icon}
      {text}
    </div>
  );
}