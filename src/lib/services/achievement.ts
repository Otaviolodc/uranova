import { ACHIEVEMENTS } from "../constants/achievements";

export interface UserAchievement {
  currentRevenue: number;
  nextGoal: number;
  achievementName: string;
  progress: number;
  color: string;
  icon: string;
}

export function getUserAchievement(
  currentRevenue: number
): UserAchievement {
  const revenue = Math.max(0, currentRevenue);

  const nextAchievement =
    ACHIEVEMENTS.find((item) => revenue < item.goal) ??
    ACHIEVEMENTS[ACHIEVEMENTS.length - 1];

  const previousGoal =
    ACHIEVEMENTS
      .filter((item) => item.goal < nextAchievement.goal)
      .at(-1)?.goal ?? 0;

  const progress =
    revenue >= nextAchievement.goal
      ? 100
      : ((revenue - previousGoal) /
          (nextAchievement.goal - previousGoal)) *
        100;

  return {
    currentRevenue: revenue,
    nextGoal: nextAchievement.goal,
    achievementName: nextAchievement.name,
    progress: Number(
      Math.max(0, Math.min(progress, 100)).toFixed(1)
    ),
    color: nextAchievement.color,
    icon: nextAchievement.icon,
  };
}