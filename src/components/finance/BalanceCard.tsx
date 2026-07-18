interface BalanceCardProps {
  title: string;
  value: number;
  color: "green" | "yellow" | "blue" | "red";
}

const colorClasses = {
  green: "text-green-400",
  yellow: "text-yellow-400",
  blue: "text-blue-400",
  red: "text-red-400",
};

export default function BalanceCard({
  title,
  value,
  color,
}: BalanceCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
      <p className="text-zinc-400 text-sm">
        {title}
      </p>

      <h2
        className={`text-4xl font-black mt-3 ${colorClasses[color]}`}
      >
        {value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </h2>
    </div>
  );
}