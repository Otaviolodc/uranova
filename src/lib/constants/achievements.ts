export interface Achievement {
  name: string;
  goal: number;
  color: string;
  icon?: string;
  image?: string;
  description: string;
  rewards: string[];
}

export const DIGITAL_ACHIEVEMENTS: Achievement[] = [
  {
    name: "Explorador",
    goal: 10_000,
    color: "#9CA3AF",
    icon: "🥉",
    description: "Seu primeiro marco na Uranova.",
    rewards: [
      "Badge Explorador",
      "Certificado Digital",
    ],
  },
  {
    name: "Impulsionador",
    goal: 50_000,
    color: "#22C55E",
    icon: "🚀",
    description: "Você está acelerando seus resultados.",
    rewards: [
      "Badge Impulsionador",
      "Certificado Premium",
    ],
  },
];

export const PHYSICAL_PLATES: Achievement[] = [
  {
    name: "Uranova Silver",
    goal: 100_000,
    color: "#C0C0C0",
    image: "/images/plates/silver.png",
    description: "Primeira placa física da Uranova.",
    rewards: [
      "Placa Uranova Silver",
      "Certificado Premium",
    ],
  },
  {
    name: "Uranova Gold",
    goal: 250_000,
    color: "#D4AF37",
    image: "/images/plates/gold.png",
    description: "Reconhecimento pelo crescimento do seu negócio.",
    rewards: [
      "Placa Uranova Gold",
      "Badge Gold",
    ],
  },
  {
    name: "Uranova Diamond",
    goal: 500_000,
    color: "#6EC6FF",
    image: "/images/plates/diamond.png",
    description: "Uma conquista reservada para grandes produtores.",
    rewards: [
      "Placa Uranova Diamond",
      "Badge Diamond",
    ],
  },
  {
    name: "Uranova Black",
    goal: 1_000_000,
    color: "#111827",
    image: "/images/plates/black.png",
    description: "Você está entre os maiores produtores da plataforma.",
    rewards: [
      "Placa Uranova Black",
      "Badge Black",
    ],
  },
  {
    name: "Hall of Fame",
    goal: 5_000_000,
    color: "#7C3AED",
    image: "/images/plates/hall-of-fame.png",
    description: "O maior reconhecimento da Uranova.",
    rewards: [
      "Placa Hall of Fame",
      "Reconhecimento Vitalício",
    ],
  },
];