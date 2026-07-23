export interface Achievement {
  name: string;
  goal: number;
  color: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    name: "Explorador",
    goal: 10_000,
    color: "#9CA3AF",
    icon: "🥉",
  },
  {
    name: "Impulsionador",
    goal: 50_000,
    color: "#22C55E",
    icon: "🚀",
  },
  {
    name: "Visionário",
    goal: 100_000,
    color: "#3B82F6",
    icon: "🔵",
  },
  {
    name: "Elite",
    goal: 250_000,
    color: "#8B5CF6",
    icon: "🟣",
  },
  {
    name: "Lendário",
    goal: 500_000,
    color: "#F59E0B",
    icon: "🏆",
  },
  {
    name: "Titan",
    goal: 1_000_000,
    color: "#111827",
    icon: "💎",
  },
  {
    name: "Ícone Uranova",
    goal: 5_000_000,
    color: "#06B6D4",
    icon: "👑",
  },
  {
    name: "Hall da Fama",
    goal: 10_000_000,
    color: "#EAB308",
    icon: "⭐",
  },
];