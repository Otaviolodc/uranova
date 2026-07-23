import { getUserAchievement } from "@/lib/services/achievement";

interface AchievementProgressProps {
  totalEarned: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AchievementProgress({
  totalEarned,
}: AchievementProgressProps) {
  const achievement = getUserAchievement(totalEarned);

  return (
    <div className="rounded-2xl border border-yellow-500/30 bg-zinc-900 px-4 py-3">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs text-zinc-400">
            Faturamento
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            {formatCurrency(totalEarned)}{" "}
            <span className="text-zinc-500">
              / {formatCurrency(achievement.nextGoal)}
            </span>
          </p>
        </div>

        {/* Futuramente será a mini placa Uranova */}
        <span className="text-2xl">
          🏆
        </span>

      </div>

      {/* Barra */}
      <div className="mt-4 h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
          style={{
            width: `${achievement.progress}%`,
          }}
        />
      </div>

      {/* Rodapé */}
      <div className="mt-3 flex items-center justify-between">

        <span
          className="text-sm font-semibold"
          style={{
            color: achievement.color,
          }}
        >
          {achievement.achievementName}
        </span>

        <span className="text-sm font-bold text-white">
          {achievement.progress}%
        </span>

      </div>

    </div>
  );
}