import { redirect } from "next/navigation";
import Image from "next/image";

import { createClient } from "@/lib/supabase/server";
import { getUserFinancialSummary } from "@/lib/services/balance";
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

  const balance = await getUserFinancialSummary(user.id);

  const totalEarned = balance?.total_net ?? 0;

  const current = getUserAchievement(totalEarned);

  return (
    <div className="relative min-h-full overflow-hidden px-4 py-6 md:px-6 md:py-8 lg:px-8">
      {/* ========================================================= */}
      {/* BACKGROUND */}
      {/* ========================================================= */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-green-500/5 blur-3xl" />
        <div className="absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[1500px] space-y-8">
        {/* ========================================================= */}
        {/* HERO */}
        {/* ========================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-zinc-800
            bg-gradient-to-br
            from-zinc-900
            via-zinc-900
            to-green-950/20
            p-6
            shadow-2xl
            md:p-8
          "
        >
          {/* brilho */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
              {/* TITULO */}

              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-green-400">
                  Evolução na Uranova
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                  Conquistas Uranova
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
                  Acompanhe sua evolução, alcance novas metas e desbloqueie
                  recompensas conforme seu faturamento cresce na plataforma.
                </p>
              </div>

              {/* NIVEL ATUAL */}

              <div
                className="
                  min-w-[210px]
                  rounded-2xl
                  border
                  px-5
                  py-4
                  xl:min-w-[230px]
                "
                style={{
                  backgroundColor: `${current.color}10`,
                  borderColor: `${current.color}35`,
                }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                  Nível atual
                </p>

                <p
                  className="mt-1 text-2xl font-black"
                  style={{
                    color: current.color,
                  }}
                >
                  {current.name}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Sua posição atual na jornada
                </p>
              </div>
            </div>

            {/* PROGRESSO */}

            <div className="mt-7 border-t border-zinc-800/80 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">
                    Faturamento atual
                  </p>

                  <p className="mt-1 text-xl font-black text-white">
                    R$ {totalEarned.toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold text-zinc-500">
                    Progresso
                  </p>

                  <p
                    className="mt-1 text-xl font-black"
                    style={{
                      color: current.color,
                    }}
                  >
                    {current.progress}%
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${current.progress}%`,
                    background: `linear-gradient(90deg, ${current.color}, ${current.color}cc)`,
                    boxShadow: `0 0 18px ${current.color}55`,
                  }}
                />
              </div>

              <div className="mt-3 flex flex-col gap-1 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Evolução dentro da Uranova
                </span>

                {current.nextGoal ? (
                  <span>
                    Próxima meta:{" "}
                    <strong className="text-zinc-300">
                      R$ {current.nextGoal.toLocaleString("pt-BR")}
                    </strong>
                  </span>
                ) : (
                  <span
                    className="font-bold"
                    style={{
                      color: current.color,
                    }}
                  >
                    Meta máxima alcançada
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CONQUISTAS DIGITAIS */}
        {/* ========================================================= */}

        <section>
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                Conquistas Digitais
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Evolua de nível e desbloqueie novas recompensas.
              </p>
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              {DIGITAL_ACHIEVEMENTS.length} níveis
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {DIGITAL_ACHIEVEMENTS.map((achievement, index) => {
              const unlocked = totalEarned >= achievement.goal;
              const currentAchievement =
                achievement.name === current.name;

              /*
               * Cada conquista recebe uma cor baseada na posição.
               * A lógica de desbloqueio continua sendo a mesma.
               */

              const colors = [
                "#3b82f6",
                "#a855f7",
                "#06b6d4",
                "#f59e0b",
                "#ef4444",
                "#22c55e",
              ];

              const accentColor =
                colors[index % colors.length];

              return (
                <article
                  key={achievement.goal}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[24px]
                    border
                    bg-zinc-900/80
                    p-5
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-2xl
                  "
                  style={{
                    borderColor: currentAchievement
                      ? `${current.color}70`
                      : unlocked
                      ? `${accentColor}45`
                      : "rgb(39 39 42)",
                  }}
                >
                  {/* brilho */}

                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      backgroundColor: `${accentColor}12`,
                    }}
                  />

                  <div className="relative">
                    {/* TOPO */}

                    <div className="flex items-start gap-4">
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          text-sm
                          font-black
                        "
                        style={{
                          color: accentColor,
                          backgroundColor: `${accentColor}12`,
                          borderColor: `${accentColor}30`,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-lg font-black text-white">
                              {achievement.name}
                            </h3>

                            <p className="mt-0.5 text-xs font-semibold text-zinc-500">
                              Meta de R${" "}
                              {achievement.goal.toLocaleString("pt-BR")}
                            </p>
                          </div>

                          {/* STATUS */}

                          {currentAchievement ? (
                            <span
                              className="inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                              style={{
                                color: current.color,
                                backgroundColor: `${current.color}12`,
                                borderColor: `${current.color}30`,
                              }}
                            >
                              Atual
                            </span>
                          ) : unlocked ? (
                            <span className="inline-flex w-fit rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-green-400">
                              Desbloqueada
                            </span>
                          ) : (
                            <span className="inline-flex w-fit rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                              Bloqueada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DESCRIÇÃO */}

                    <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                      {achievement.description}
                    </p>

                    {/* META + RECOMPENSAS */}

                    <div className="mt-5 grid gap-4 sm:grid-cols-[0.7fr_1.3fr]">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                          Meta
                        </p>

                        <p className="mt-1 text-base font-black text-white">
                          R$ {achievement.goal.toLocaleString("pt-BR")}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                          Recompensas
                        </p>

                        <div className="mt-2 space-y-1.5">
                          {achievement.rewards.map((reward) => (
                            <div
                              key={reward}
                              className="flex items-start gap-2 text-xs text-zinc-300"
                            >
                              <span className="mt-0.5 font-black text-green-400">
                                ✓
                              </span>

                              <span>{reward}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* PROGRESSO DA CONQUISTA ATUAL */}

                    {currentAchievement && (
                      <div className="mt-5 border-t border-zinc-800 pt-4">
                        <div className="mb-2 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-zinc-500">
                            Progresso atual
                          </span>

                          <span
                            className="font-black"
                            style={{
                              color: current.color,
                            }}
                          >
                            {current.progress}%
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${current.progress}%`,
                              backgroundColor: current.color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* PLACAS URANOVA */}
        {/* ========================================================= */}

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              Placas Uranova
            </h2>

            <p className="mt-1 max-w-2xl text-sm text-zinc-500">
              Alcance grandes resultados e desbloqueie placas exclusivas
              para celebrar sua evolução.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {PHYSICAL_PLATES.map((plate, index) => {
              const unlocked = totalEarned >= plate.goal;
              const currentPlate = plate.name === current.name;

              const colors = [
                "#a855f7",
                "#06b6d4",
                "#f59e0b",
                "#ef4444",
                "#22c55e",
                "#3b82f6",
              ];

              const accentColor =
                colors[index % colors.length];

              return (
                <article
                  key={plate.goal}
                  className="
                    group
                    overflow-hidden
                    rounded-[24px]
                    border
                    bg-zinc-900/80
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-2xl
                  "
                  style={{
                    borderColor: currentPlate
                      ? `${current.color}70`
                      : unlocked
                      ? `${accentColor}45`
                      : "rgb(39 39 42)",
                  }}
                >
                  {/* IMAGEM */}

                  <div
                    className="relative flex h-48 items-center justify-center overflow-hidden border-b bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
                    style={{
                      borderColor: `${accentColor}18`,
                    }}
                  >
                    <div
                      className="pointer-events-none absolute h-36 w-36 rounded-full blur-3xl"
                      style={{
                        backgroundColor: `${accentColor}10`,
                      }}
                    />

                    {plate.image ? (
                      <Image
                        src={plate.image}
                        alt={plate.name}
                        width={260}
                        height={170}
                        className="relative z-10 max-h-40 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="relative z-10 flex flex-col items-center text-zinc-600">
                        <div
                          className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border text-lg font-black"
                          style={{
                            color: accentColor,
                            backgroundColor: `${accentColor}10`,
                            borderColor: `${accentColor}25`,
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <p className="text-xs">
                          Imagem da placa
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CONTEÚDO */}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-white">
                          {plate.name}
                        </h3>

                        <p className="mt-1 text-xs font-semibold text-zinc-500">
                          Meta: R${" "}
                          {plate.goal.toLocaleString("pt-BR")}
                        </p>
                      </div>

                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black"
                        style={{
                          color: accentColor,
                          backgroundColor: `${accentColor}10`,
                          borderColor: `${accentColor}25`,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="mt-4 min-h-[42px] text-sm leading-relaxed text-zinc-400">
                      {plate.description}
                    </p>

                    {/* STATUS */}

                    <div className="mt-5 border-t border-zinc-800 pt-4">
                      {currentPlate ? (
                        <div
                          className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                          style={{
                            color: current.color,
                            backgroundColor: `${current.color}10`,
                            borderColor: `${current.color}25`,
                          }}
                        >
                          <span className="text-xs font-black uppercase tracking-wider">
                            Placa atual
                          </span>

                          <span className="text-xs font-black">
                            Em progresso
                          </span>
                        </div>
                      ) : unlocked ? (
                        <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2.5 text-green-400">
                          <span className="text-xs font-black uppercase tracking-wider">
                            Desbloqueada
                          </span>

                          <span className="text-xs font-black">
                            Conquistada
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-zinc-600">
                          <span className="text-xs font-black uppercase tracking-wider">
                            Bloqueada
                          </span>

                          <span className="text-xs font-black">
                            Em evolução
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* FOOTER */}
        {/* ========================================================= */}

        <div className="border-t border-zinc-900 pt-2 pb-4 text-center">
          <p className="text-xs text-zinc-600">
            Continue evoluindo. Cada conquista representa um novo marco
            na sua jornada com a Uranova.
          </p>
        </div>
      </div>
    </div>
  );
}