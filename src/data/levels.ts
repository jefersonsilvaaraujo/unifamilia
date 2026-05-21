import type { GameModeId } from "./gameModes";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TimedCycle = {
  activeDuration: number;
  inactiveDuration: number;
  offset: number;
};

export type Platform = Rect & {
  variant?: "solid" | "vanishing";
  cycle?: TimedCycle;
  modes?: GameModeId[];
};

export type Bit = Rect & {
  id: number;
  label: "0" | "1";
  collected: boolean;
};

export type BugLevel = 1 | 2 | 3;

export type Bug = Rect & {
  id: number;
  level: BugLevel;
  label: string;
  movement?: {
    minX: number;
    maxX: number;
    speed: number;
    direction: 1 | -1;
    minY?: number;
    maxY?: number;
    verticalSpeed?: number;
    verticalDirection?: 1 | -1;
  };
};

export type Hazard =
  | (Rect & {
      id: number;
      type: "laser";
      label: string;
      cycle: TimedCycle;
      modes?: GameModeId[];
    })
  | (Rect & {
      id: number;
      type: "slow-zone";
      label: string;
      speedMultiplier: number;
      modes?: GameModeId[];
    })
  | (Rect & {
      id: number;
      type: "trap-bit";
      label: "0" | "1";
      collected: boolean;
      penaltySeconds: number;
      scorePenalty: number;
      modes?: GameModeId[];
    });

export type LevelConfig = {
  id: number;
  title: string;
  hint: string;
  worldWidth: number;
  portalX: number;
  timeBonus: number;
  platforms: Platform[];
  bits: Bit[];
  bugs: Bug[];
  hazards?: Hazard[];
};

export const STAGE_HEIGHT = 540;
export const GROUND_Y = 490;

const bit = (id: number, x: number, y: number, label: "0" | "1"): Bit => ({
  id,
  x,
  y,
  width: 28,
  height: 28,
  label,
  collected: false,
});

const adultModes: GameModeId[] = ["normal", "desafio", "uma-vida"];

const trapBit = (id: number, x: number, y: number, label: "0" | "1", penaltySeconds = 5): Hazard => ({
  id,
  type: "trap-bit",
  x,
  y,
  width: 28,
  height: 28,
  label,
  collected: false,
  penaltySeconds,
  scorePenalty: 15,
  modes: adultModes,
});

export const levels: LevelConfig[] = [
  {
    id: 1,
    title: "Fase 1: Primeiros bits",
    hint: "Colete os bits e teste os primeiros pulos.",
    worldWidth: 1700,
    portalX: 1585,
    timeBonus: 12,
    platforms: [
      { x: 0, y: GROUND_Y, width: 1700, height: 50 },
      { x: 300, y: 405, width: 180, height: 20 },
      { x: 610, y: 350, width: 210, height: 20 },
      { x: 980, y: 420, width: 190, height: 20 },
      { x: 1280, y: 365, width: 220, height: 20 },
    ],
    bits: [
      bit(1, 180, GROUND_Y - 88, "1"),
      bit(2, 355, 360, "0"),
      bit(3, 450, 360, "1"),
      bit(4, 675, 306, "0"),
      bit(5, 780, 306, "1"),
      bit(6, 1040, 374, "0"),
      bit(7, 1348, 320, "1"),
      bit(8, 1488, 320, "0"),
    ],
    bugs: [
      { id: 1, x: 520, y: GROUND_Y - 38, width: 48, height: 38, level: 1, label: "bug" },
      { id: 2, x: 880, y: GROUND_Y - 42, width: 52, height: 42, level: 1, label: "bug" },
      { id: 3, x: 1450, y: 365 - 36, width: 46, height: 36, level: 1, label: "bug" },
    ],
  },
  {
    id: 2,
    title: "Fase 2: Bugs em movimento",
    hint: "Alguns bugs patrulham a fase. Observe o ritmo antes de pular.",
    worldWidth: 1900,
    portalX: 1785,
    timeBonus: 14,
    platforms: [
      { x: 0, y: GROUND_Y, width: 1900, height: 50 },
      { x: 260, y: 405, width: 160, height: 20 },
      { x: 545, y: 342, width: 180, height: 20 },
      { x: 875, y: 410, width: 170, height: 20 },
      { x: 1160, y: 352, width: 170, height: 20 },
      { x: 1470, y: 395, width: 220, height: 20 },
    ],
    bits: [
      bit(1, 170, GROUND_Y - 88, "0"),
      bit(2, 305, 360, "1"),
      bit(3, 590, 298, "1"),
      bit(4, 690, 298, "0"),
      bit(5, 930, 366, "1"),
      bit(6, 1218, 308, "0"),
      bit(7, 1510, 350, "1"),
      bit(8, 1640, 350, "0"),
      bit(9, 1725, GROUND_Y - 90, "1"),
    ],
    bugs: [
      {
        id: 1,
        x: 455,
        y: GROUND_Y - 42,
        width: 52,
        height: 42,
        level: 2,
        label: "bug 2",
        movement: { minX: 430, maxX: 700, speed: 115, direction: 1 },
      },
      { id: 2, x: 805, y: GROUND_Y - 48, width: 58, height: 48, level: 2, label: "bug 2" },
      {
        id: 3,
        x: 1080,
        y: GROUND_Y - 44,
        width: 54,
        height: 44,
        level: 2,
        label: "bug 2",
        movement: { minX: 1060, maxX: 1330, speed: 130, direction: -1 },
      },
      {
        id: 4,
        x: 1540,
        y: 395 - 38,
        width: 48,
        height: 38,
        level: 2,
        label: "bug 2",
        movement: { minX: 1480, maxX: 1680, speed: 90, direction: 1 },
      },
    ],
    hazards: [
      {
        id: 1,
        type: "slow-zone",
        label: "lag",
        x: 735,
        y: GROUND_Y - 12,
        width: 230,
        height: 12,
        speedMultiplier: 0.58,
        modes: adultModes,
      },
      {
        id: 2,
        type: "laser",
        label: "firewall",
        x: 1368,
        y: GROUND_Y - 104,
        width: 16,
        height: 104,
        cycle: { activeDuration: 1.15, inactiveDuration: 0.95, offset: 0.25 },
        modes: adultModes,
      },
      trapBit(3, 1018, GROUND_Y - 88, "1", 4),
    ],
  },
  {
    id: 3,
    title: "Fase 3: Corrida final",
    hint: "Bugs maiores, menos espaço e menos tempo para pensar.",
    worldWidth: 2100,
    portalX: 1985,
    timeBonus: 0,
    platforms: [
      { x: 0, y: GROUND_Y, width: 2100, height: 50 },
      { x: 245, y: 398, width: 145, height: 20 },
      { x: 505, y: 338, width: 160, height: 20 },
      { x: 760, y: 422, width: 135, height: 20 },
      { x: 1010, y: 355, width: 155, height: 20 },
      { x: 1295, y: 405, width: 145, height: 20 },
      { x: 1600, y: 342, width: 210, height: 20 },
    ],
    bits: [
      bit(1, 162, GROUND_Y - 88, "1"),
      bit(2, 292, 352, "0"),
      bit(3, 548, 294, "1"),
      bit(4, 804, 376, "0"),
      bit(5, 1058, 310, "1"),
      bit(6, 1340, 360, "0"),
      bit(7, 1648, 298, "1"),
      bit(8, 1760, 298, "0"),
      bit(9, 1880, GROUND_Y - 92, "1"),
      bit(10, 1935, GROUND_Y - 92, "0"),
    ],
    bugs: [
      {
        id: 1,
        x: 430,
        y: GROUND_Y - 56,
        width: 68,
        height: 56,
        level: 3,
        label: "bug 3",
        movement: { minX: 420, maxX: 650, speed: 145, direction: 1 },
      },
      {
        id: 2,
        x: 905,
        y: GROUND_Y - 64,
        width: 78,
        height: 64,
        level: 3,
        label: "bug 3",
      },
      {
        id: 3,
        x: 1195,
        y: GROUND_Y - 52,
        width: 62,
        height: 52,
        level: 2,
        label: "bug 2",
        movement: { minX: 1185, maxX: 1450, speed: 155, direction: -1 },
      },
      {
        id: 4,
        x: 1685,
        y: 342 - 44,
        width: 56,
        height: 44,
        level: 3,
        label: "bug 3",
        movement: { minX: 1610, maxX: 1800, speed: 120, direction: 1 },
      },
      { id: 5, x: 1845, y: GROUND_Y - 46, width: 54, height: 46, level: 2, label: "bug 2" },
    ],
    hazards: [
      {
        id: 1,
        type: "laser",
        label: "firewall",
        x: 708,
        y: GROUND_Y - 96,
        width: 16,
        height: 96,
        cycle: { activeDuration: 0.95, inactiveDuration: 0.75, offset: 0 },
        modes: adultModes,
      },
      {
        id: 2,
        type: "laser",
        label: "firewall",
        x: 1512,
        y: GROUND_Y - 116,
        width: 16,
        height: 116,
        cycle: { activeDuration: 1.2, inactiveDuration: 0.7, offset: 0.45 },
        modes: adultModes,
      },
      {
        id: 3,
        type: "slow-zone",
        label: "lag",
        x: 1225,
        y: GROUND_Y - 12,
        width: 250,
        height: 12,
        speedMultiplier: 0.52,
        modes: adultModes,
      },
      trapBit(4, 736, GROUND_Y - 86, "0", 5),
    ],
  },
  {
    id: 4,
    title: "Fase 4: Rota expert",
    hint: "Rotas de risco valem mais pontos, mas firewalls alternam o caminho.",
    worldWidth: 2300,
    portalX: 2185,
    timeBonus: 8,
    platforms: [
      { x: 0, y: GROUND_Y, width: 2300, height: 50 },
      { x: 245, y: 402, width: 135, height: 20 },
      { x: 465, y: 342, width: 145, height: 20 },
      {
        x: 700,
        y: 386,
        width: 120,
        height: 20,
        variant: "vanishing",
        cycle: { activeDuration: 1.45, inactiveDuration: 0.75, offset: 0.2 },
      },
      { x: 930, y: 324, width: 145, height: 20 },
      { x: 1160, y: 418, width: 135, height: 20 },
      { x: 1385, y: 352, width: 150, height: 20 },
      {
        x: 1645,
        y: 388,
        width: 130,
        height: 20,
        variant: "vanishing",
        cycle: { activeDuration: 1.15, inactiveDuration: 0.85, offset: 0.8 },
      },
      { x: 1895, y: 334, width: 190, height: 20 },
    ],
    bits: [
      bit(1, 168, GROUND_Y - 88, "1"),
      bit(2, 286, 356, "0"),
      bit(3, 500, 298, "1"),
      bit(4, 728, 342, "0"),
      bit(5, 965, 280, "1"),
      bit(6, 1220, 374, "0"),
      bit(7, 1430, 308, "1"),
      bit(8, 1688, 344, "0"),
      bit(9, 1938, 290, "1"),
      bit(10, 2050, 290, "0"),
      bit(11, 2118, GROUND_Y - 90, "1"),
      bit(12, 2162, GROUND_Y - 90, "0"),
    ],
    bugs: [
      {
        id: 1,
        x: 405,
        y: GROUND_Y - 48,
        width: 58,
        height: 48,
        level: 2,
        label: "bug 2",
        movement: { minX: 390, maxX: 650, speed: 145, direction: 1 },
      },
      {
        id: 2,
        x: 845,
        y: 300,
        width: 54,
        height: 42,
        level: 3,
        label: "bug 3",
        movement: {
          minX: 810,
          maxX: 1115,
          speed: 122,
          direction: 1,
          minY: 272,
          maxY: 384,
          verticalSpeed: 82,
          verticalDirection: 1,
        },
      },
      {
        id: 3,
        x: 1320,
        y: GROUND_Y - 58,
        width: 68,
        height: 58,
        level: 3,
        label: "bug 3",
        movement: { minX: 1305, maxX: 1570, speed: 165, direction: -1 },
      },
      {
        id: 4,
        x: 1788,
        y: GROUND_Y - 50,
        width: 58,
        height: 50,
        level: 2,
        label: "bug 2",
        movement: { minX: 1765, maxX: 2015, speed: 150, direction: 1 },
      },
    ],
    hazards: [
      {
        id: 1,
        type: "laser",
        label: "firewall",
        x: 650,
        y: GROUND_Y - 114,
        width: 16,
        height: 114,
        cycle: { activeDuration: 0.9, inactiveDuration: 0.75, offset: 0.1 },
      },
      {
        id: 2,
        type: "laser",
        label: "firewall",
        x: 1588,
        y: GROUND_Y - 126,
        width: 16,
        height: 126,
        cycle: { activeDuration: 1, inactiveDuration: 0.7, offset: 0.55 },
      },
      {
        id: 3,
        type: "slow-zone",
        label: "lag",
        x: 1085,
        y: GROUND_Y - 12,
        width: 260,
        height: 12,
        speedMultiplier: 0.5,
      },
      trapBit(4, 1138, GROUND_Y - 86, "1", 6),
      trapBit(5, 1864, GROUND_Y - 86, "0", 6),
    ],
  },
  {
    id: 5,
    title: "Fase 5: Deploy final",
    hint: "O portal final só abre para quem coleta todos os bits sem desperdiçar tempo.",
    worldWidth: 2500,
    portalX: 2380,
    timeBonus: 0,
    platforms: [
      { x: 0, y: GROUND_Y, width: 2500, height: 50 },
      { x: 230, y: 392, width: 120, height: 20 },
      {
        x: 430,
        y: 330,
        width: 125,
        height: 20,
        variant: "vanishing",
        cycle: { activeDuration: 1.05, inactiveDuration: 0.8, offset: 0.15 },
      },
      { x: 645, y: 410, width: 120, height: 20 },
      { x: 860, y: 348, width: 125, height: 20 },
      {
        x: 1085,
        y: 286,
        width: 115,
        height: 20,
        variant: "vanishing",
        cycle: { activeDuration: 1.2, inactiveDuration: 0.75, offset: 0.75 },
      },
      { x: 1290, y: 376, width: 128, height: 20 },
      { x: 1510, y: 316, width: 128, height: 20 },
      {
        x: 1740,
        y: 390,
        width: 125,
        height: 20,
        variant: "vanishing",
        cycle: { activeDuration: 1, inactiveDuration: 0.9, offset: 0.45 },
      },
      { x: 1970, y: 330, width: 165, height: 20 },
      { x: 2195, y: 405, width: 115, height: 20 },
    ],
    bits: [
      bit(1, 150, GROUND_Y - 88, "1"),
      bit(2, 270, 348, "0"),
      bit(3, 468, 286, "1"),
      bit(4, 690, 366, "0"),
      bit(5, 900, 304, "1"),
      bit(6, 1126, 242, "0"),
      bit(7, 1335, 332, "1"),
      bit(8, 1552, 272, "0"),
      bit(9, 1782, 346, "1"),
      bit(10, 2020, 286, "0"),
      bit(11, 2090, 286, "1"),
      bit(12, 2234, 360, "0"),
      bit(13, 2316, GROUND_Y - 92, "1"),
    ],
    bugs: [
      {
        id: 1,
        x: 360,
        y: GROUND_Y - 56,
        width: 66,
        height: 56,
        level: 3,
        label: "bug 3",
        movement: { minX: 350, maxX: 590, speed: 168, direction: 1 },
      },
      {
        id: 2,
        x: 790,
        y: GROUND_Y - 48,
        width: 56,
        height: 48,
        level: 2,
        label: "bug 2",
        movement: { minX: 780, maxX: 1010, speed: 174, direction: -1 },
      },
      {
        id: 3,
        x: 1215,
        y: 260,
        width: 58,
        height: 44,
        level: 3,
        label: "bug 3",
        movement: {
          minX: 1200,
          maxX: 1500,
          speed: 134,
          direction: 1,
          minY: 244,
          maxY: 396,
          verticalSpeed: 96,
          verticalDirection: -1,
        },
      },
      {
        id: 4,
        x: 1665,
        y: GROUND_Y - 60,
        width: 72,
        height: 60,
        level: 3,
        label: "bug 3",
        movement: { minX: 1650, maxX: 1910, speed: 184, direction: 1 },
      },
      {
        id: 5,
        x: 2118,
        y: GROUND_Y - 52,
        width: 62,
        height: 52,
        level: 2,
        label: "bug 2",
        movement: { minX: 2100, maxX: 2320, speed: 162, direction: -1 },
      },
    ],
    hazards: [
      {
        id: 1,
        type: "laser",
        label: "firewall",
        x: 610,
        y: GROUND_Y - 126,
        width: 16,
        height: 126,
        cycle: { activeDuration: 0.8, inactiveDuration: 0.7, offset: 0 },
      },
      {
        id: 2,
        type: "laser",
        label: "firewall",
        x: 1040,
        y: GROUND_Y - 148,
        width: 16,
        height: 148,
        cycle: { activeDuration: 0.95, inactiveDuration: 0.65, offset: 0.45 },
      },
      {
        id: 3,
        type: "laser",
        label: "firewall",
        x: 1940,
        y: GROUND_Y - 128,
        width: 16,
        height: 128,
        cycle: { activeDuration: 0.75, inactiveDuration: 0.85, offset: 0.25 },
      },
      {
        id: 4,
        type: "slow-zone",
        label: "lag",
        x: 1405,
        y: GROUND_Y - 12,
        width: 270,
        height: 12,
        speedMultiplier: 0.48,
      },
      trapBit(5, 1010, GROUND_Y - 86, "0", 7),
      trapBit(6, 1876, GROUND_Y - 86, "1", 7),
    ],
  },
];
