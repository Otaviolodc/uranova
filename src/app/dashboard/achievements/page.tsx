import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getUserBalance } from "@/lib/services/balance";
import { getUserAchievement } from "@/lib/services/achievement";
import { ACHIEVEMENTS } from "@/lib/constants/achievements";

export default async function AchievementsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const balance = await getUserBalance(user.id);

  const totalEarned = balance?.total_earned ?? 0;

  const current = getUserAchievement(totalEarned);

  return (
    <div className="space-y-8">

      {/* Hero */}

      <div className="rounded-2xl border bg-card p-6">

        <h1 className="text-2xl font-bold">
          🏆 Conquistas Uranova
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Sua jornada como produtor começa aqui. Continue vendendo para
          desbloquear novas conquistas e alcançar os maiores níveis da
          plataforma.
        </p>

        <div className="mt-4 space-y-3">

          <div className="flex items-center justify-between">

            <div
              className="text-2xl font-bold"
              style={{ color: current.color }}
            >
              {current.icon} {current.name}
            </div>

            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {current.progress}%
            </div>

          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${current.progress}%`,
              }}
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">

            {current.nextGoal ? (
              <>
                <strong>
                  R$ {totalEarned.toLocaleString("pt-BR")}
                </strong>

                {" / "}

                <strong>
                  R$ {current.currentGoal.toLocaleString("pt-BR")}
                </strong>
              </>
            ) : (
              "Meta máxima alcançada"
            )}

          </div>

        </div>

      </div>

      {/* Lista */}

      <div className="space-y-6">

        {ACHIEVEMENTS.map((achievement) => {

          const unlocked = totalEarned >= achievement.goal;
          const currentAchievement = achievement.name === current.name;

          return (
            <div
              key={achievement.goal}
              className={`rounded-2xl border p-6 transition-all ${
                currentAchievement
                  ? "border-primary"
                  : unlocked
                  ? "border-green-500"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">

                <span className="text-3xl">
                  {achievement.icon}
                </span>

                <div>

                  <h2 className="text-xl font-bold">
                    {achievement.name}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Meta de R${" "}
                    {achievement.goal.toLocaleString("pt-BR")}
                  </p>

                </div>

              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                {achievement.description}
              </p>

              <hr className="my-5 border-border" />

              <div>

                <h3 className="font-semibold">
                  🎁 Recompensas
                </h3>

                <ul className="mt-2 space-y-2 text-sm">

                  {achievement.rewards.map((reward) => (
                    <li key={reward}>
                      ✔ {reward}
                    </li>
                  ))}

                </ul>

              </div>

              <div className="mt-6">

                {currentAchievement ? (
                  <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                    🏆 Conquista Atual
                  </span>
                ) : unlocked ? (
                  <span className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-medium text-white">
                    ✅ Desbloqueada
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-4 py-1.5 text-sm">
                    🔒 Bloqueada
                  </span>
                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}