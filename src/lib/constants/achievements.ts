export interface Achievement {
  name: string;
  goal: number;
  color: string;
  icon: string;
  description: string;
  rewards: string[];
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    name: "Explorador",
    goal: 10_000,
    color: "#9CA3AF",
    icon: "🥉",
    description:
      "Toda grande jornada começa com o primeiro resultado. Você iniciou sua trajetória na Uranova e deu o primeiro passo rumo ao sucesso.",
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
    description:
      "Seu negócio começou a ganhar velocidade. Você demonstra consistência e evolução dentro da plataforma.",
    rewards: [
      "Badge Impulsionador",
      "Certificado Premium",
    ],
  },
  {
    name: "Visionário",
    goal: 100_000,
    color: "#3B82F6",
    icon: "🔵",
    description:
      "Você já faz parte do grupo de produtores que transformam conhecimento em grandes resultados.",
    rewards: [
      "Badge Visionário",
      "Certificado Premium",
      "Placa Oficial Uranova",
    ],
  },
  {
    name: "Elite",
    goal: 250_000,
    color: "#8B5CF6",
    icon: "🟣",
    description:
      "Seu crescimento demonstra maturidade, profissionalismo e consistência. Você está entre os principais produtores da Uranova.",
    rewards: [
      "Badge Elite",
      "Certificado Premium",
      "Placa Elite Uranova",
    ],
  },
  {
    name: "Lendário",
    goal: 500_000,
    color: "#F59E0B",
    icon: "🏆",
    description:
      "Sua marca inspira milhares de pessoas. Você alcançou um nível de excelência que poucos produtores conquistam.",
    rewards: [
      "Badge Lendário",
      "Certificado Premium",
      "Placa Gold Uranova",
    ],
  },
  {
    name: "Titan",
    goal: 1_000_000,
    color: "#111827",
    icon: "💎",
    description:
      "Você entrou para a elite absoluta da Uranova. Sua trajetória se tornou referência para toda a comunidade.",
    rewards: [
      "Badge Titan",
      "Placa Titan Uranova",
      "Hall de Destaque",
    ],
  },
  {
    name: "Ícone Uranova",
    goal: 5_000_000,
    color: "#06B6D4",
    icon: "👑",
    description:
      "Seu impacto ultrapassa os números. Você se tornou um dos maiores nomes da história da Uranova.",
    rewards: [
      "Badge Ícone Uranova",
      "Placa Diamond Uranova",
      "Evento Exclusivo",
    ],
  },
  {
    name: "Hall da Fama",
    goal: 10_000_000,
    color: "#EAB308",
    icon: "⭐",
    description:
      "Você alcançou o maior reconhecimento da plataforma e entrou definitivamente para a história da Uranova.",
    rewards: [
      "Badge Hall da Fama",
      "Placa Hall da Fama",
      "Reconhecimento Vitalício",
    ],
  },
];