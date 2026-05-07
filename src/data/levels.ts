export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
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
  };
};

export type LevelConfig = {
  id: number;
  title: string;
  hint: string;
  worldWidth: number;
  portalX: number;
  timeBonus: number;
  platforms: Rect[];
  bits: Bit[];
  bugs: Bug[];
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
  },
  {
    id: 3,
    title: "Fase 3: Corrida final",
    hint: "Bugs maiores, menos espaco e menos tempo para pensar.",
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
  },
];
