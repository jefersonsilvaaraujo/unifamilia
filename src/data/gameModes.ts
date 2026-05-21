export type GameModeId = "infantil" | "normal" | "desafio" | "uma-vida";

export type PortalRequirement = {
  ratio: number;
  label: string;
};

export type GameMode = {
  id: GameModeId;
  name: string;
  shortName: string;
  description: string;
  startingLives: number;
  startTime: number;
  maxTimeAfterBonus: number;
  bugSpeedMultiplier: number;
  timeBonusMultiplier: number;
  scoreMultiplier: number;
  levelCount: number;
  portalRequirement: PortalRequirement;
  advancedScoring: boolean;
  advancedHazards: boolean;
  dailyVariant: boolean;
};

export const gameModes: GameMode[] = [
  {
    id: "infantil",
    name: "Infantil",
    shortName: "Infantil",
    description: "Modo atual: 3 fases, 3 vidas, portal livre e ritmo mais tranquilo.",
    startingLives: 3,
    startTime: 70,
    maxTimeAfterBonus: 95,
    bugSpeedMultiplier: 1,
    timeBonusMultiplier: 1,
    scoreMultiplier: 1,
    levelCount: 3,
    portalRequirement: { ratio: 0, label: "Portal livre" },
    advancedScoring: false,
    advancedHazards: false,
    dailyVariant: false,
  },
  {
    id: "normal",
    name: "Normal",
    shortName: "Normal",
    description: "Mais pressão, 4 fases, obstáculos novos e portal exige parte dos bits.",
    startingLives: 3,
    startTime: 64,
    maxTimeAfterBonus: 86,
    bugSpeedMultiplier: 1.16,
    timeBonusMultiplier: 0.8,
    scoreMultiplier: 1.15,
    levelCount: 4,
    portalRequirement: { ratio: 0.65, label: "65% dos bits" },
    advancedScoring: true,
    advancedHazards: true,
    dailyVariant: true,
  },
  {
    id: "desafio",
    name: "Desafio",
    shortName: "Desafio",
    description: "5 fases, bugs mais rápidos, todos os bits obrigatórios e bônus por precisão.",
    startingLives: 2,
    startTime: 56,
    maxTimeAfterBonus: 76,
    bugSpeedMultiplier: 1.34,
    timeBonusMultiplier: 0.55,
    scoreMultiplier: 1.35,
    levelCount: 5,
    portalRequirement: { ratio: 1, label: "Todos os bits" },
    advancedScoring: true,
    advancedHazards: true,
    dailyVariant: true,
  },
  {
    id: "uma-vida",
    name: "1 Vida",
    shortName: "1 Vida",
    description: "Modo adulto extremo: 5 fases, uma vida, todos os bits e maior multiplicador.",
    startingLives: 1,
    startTime: 54,
    maxTimeAfterBonus: 72,
    bugSpeedMultiplier: 1.42,
    timeBonusMultiplier: 0.45,
    scoreMultiplier: 1.6,
    levelCount: 5,
    portalRequirement: { ratio: 1, label: "Todos os bits" },
    advancedScoring: true,
    advancedHazards: true,
    dailyVariant: true,
  },
];

export const defaultGameMode = gameModes[0];

export function getGameMode(modeId: GameModeId) {
  return gameModes.find((mode) => mode.id === modeId) ?? defaultGameMode;
}
