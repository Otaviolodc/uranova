import {
  DIGITAL_ACHIEVEMENTS,
  PHYSICAL_PLATES,
} from "../constants/achievements";

const ACHIEVEMENTS = [
  ...DIGITAL_ACHIEVEMENTS,
  ...PHYSICAL_PLATES,
];

export interface UserAchievement {
  currentRevenue: number;
  currentGoal: number;
  nextGoal: number | null;
  name: string;
  goal: number;
  description: string;
  rewards: string[];
  progress: number;
  color: string;
  icon: string;
}

export function getUserAchievement(
  currentRevenue: number
): UserAchievement {
  const revenue = Math.max(0, currentRevenue);

  let currentAchievement = ACHIEVEMENTS[0];

  for (const achievement of ACHIEVEMENTS) {
    if (revenue >= achievement.goal) {
      currentAchievement = achievement;
    } else {
      break;
    }
  }

  const currentIndex = ACHIEVEMENTS.findIndex(
    (item) => item.goal === currentAchievement.goal
  );

  const nextAchievement =
    ACHIEVEMENTS[currentIndex + 1] ?? null;

  const previousGoal =
    currentIndex === 0
      ? 0
      : ACHIEVEMENTS[currentIndex - 1].goal;

  const currentGoal = currentAchievement.goal;

  const nextGoal =
    nextAchievement?.goal ?? null;

  const progress =
    nextGoal === null
      ? 100
      : ((revenue - previousGoal) /
          (nextGoal - previousGoal)) *
        100;

  return {
    currentRevenue: revenue,
    currentGoal,
    nextGoal,
    name: currentAchievement.name,
    goal: currentAchievement.goal,
    description: currentAchievement.description,
    rewards: currentAchievement.rewards,
    progress: Number(
      Math.max(0, Math.min(progress, 100)).toFixed(1)
    ),
    color: currentAchievement.color,
    icon: currentAchievement.icon,
  };
}