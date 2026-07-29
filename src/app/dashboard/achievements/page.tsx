import { redirect } from "next/navigation";
import Image from "next/image";

import { createClient } from "@/lib/supabase/server";
import { getUserBalance } from "@/lib/services/balance";
import { getUserAchievement } from "@/lib/services/achievement";
import {
  DIGITAL_ACHIEVEMENTS,
  PHYSICAL_PLATES,
} from "@/lib/constants/achievements";

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
    <div className="space-y-10">

      {/* Hero */}

      <div className="rounded-2xl border bg-card p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              🏆 Conquistas Uranova
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Acompanhe sua evolução e desbloqueie conquistas digitais
              e placas exclusivas da Uranova conforme seu faturamento
              cresce na plataforma.
            </p>

          </div>

          <div
            className="rounded-xl px-5 py-3 text-center"
            style={{
              backgroundColor: `${current.color}15`,
            }}
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Nível Atual
            </p>

            <p
              className="mt-1 text-xl font-bold"
              style={{
                color: current.color,
              }}
            >
              {current.icon} {current.name}
            </p>

          </div>

        </div>

        <div className="mt-8">

          <div className="mb-2 flex items-center justify-between text-sm">

            <span className="font-medium">
              Progresso
            </span>

            <span className="font-semibold text-primary">
              {current.progress}%
            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-muted">

            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${current.progress}%`,
              }}
            />

          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">

            <span>
              R$ {totalEarned.toLocaleString("pt-BR")}
            </span>

            {current.nextGoal ? (
              <span>
                Próxima meta:{" "}
                <strong>
                  R$ {current.nextGoal.toLocaleString("pt-BR")}
                </strong>
              </span>
            ) : (
              <span className="font-semibold text-green-600">
                🎉 Meta máxima alcançada
              </span>
            )}

          </div>

        </div>

      </div>

      {/* Conquistas Digitais */}

      <div>

  <div className="mb-6">

    <h2 className="text-2xl font-bold">
      🏆 Conquistas Digitais
    </h2>

    <p className="mt-1 text-sm text-muted-foreground">
      Desbloqueie recompensas digitais conforme evolui dentro da
      Uranova.
    </p>

  </div>

  <div className="space-y-6">

    {DIGITAL_ACHIEVEMENTS.map((achievement) => {

      const unlocked = totalEarned >= achievement.goal;
      const currentAchievement =
        achievement.name === current.name;

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

          <div className="flex items-center gap-4">

            <div className="text-4xl">
              {achievement.icon}
            </div>

            <div className="flex-1">

              <h3 className="text-xl font-bold">
                {achievement.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                Meta: R${" "}
                {achievement.goal.toLocaleString("pt-BR")}
              </p>

            </div>

          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {achievement.description}
          </p>

          <div className="mt-5">

            <h4 className="font-semibold">
              🎁 Recompensas
            </h4>

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

              <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                🏆 Conquista Atual
              </span>

            ) : unlocked ? (

              <span className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white">
                ✅ Desbloqueada
              </span>

            ) : (

              <span className="rounded-full bg-muted px-4 py-2 text-sm">
                🔒 Bloqueada
              </span>

            )}

          </div>

        </div>

      );

    })}

  </div>

</div>

{/* Placas Uranova */}

<div>

  <div className="mb-6 mt-12">

    <h2 className="text-2xl font-bold">
      🏅 Placas Uranova
    </h2>

    <p className="mt-1 text-sm text-muted-foreground">
      Alcance grandes resultados e receba uma placa exclusiva da
      Uranova para celebrar sua conquista.
    </p>

  </div>

  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

    {PHYSICAL_PLATES.map((plate) => {

      const unlocked = totalEarned >= plate.goal;
      const currentPlate = plate.name === current.name;

      return (

        <div
          key={plate.goal}
          className={`overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg ${
            currentPlate
              ? "border-primary"
              : unlocked
              ? "border-green-500"
              : ""
          }`}
        >

          <div className="flex h-56 items-center justify-center border-b bg-muted">

            {plate.image ? (

              <Image
                src={plate.image}
                alt={plate.name}
                width={260}
                height={170}
                className="object-contain"
              />

            ) : (

              <div className="text-center text-muted-foreground">

                <div className="text-5xl mb-2">
                  🏅
                </div>

                <p>Imagem da Placa</p>

              </div>

            )}

          </div>

          <div className="space-y-4 p-6">

            <div>

              <h3 className="text-xl font-bold">
                {plate.name}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Meta:
                {" "}
                R$
                {" "}
                {plate.goal.toLocaleString("pt-BR")}
              </p>

            </div>

            <p className="text-sm text-muted-foreground">
              {plate.description}
            </p>

            <div>

              {currentPlate ? (

                <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  🏆 Placa Atual
                </span>

              ) : unlocked ? (

                <span className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white">
                  ✅ Desbloqueada
                </span>

              ) : (

                <span className="rounded-full bg-muted px-4 py-2 text-sm">
                  🔒 Bloqueada
                </span>

              )}

            </div>

          </div>

        </div>

      );

    })}

  </div>

</div>

    </div>
  );
}
