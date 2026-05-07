import type { GameOutcome } from "../App";

export type PlayerRecord = {
  id: string;
  name: string;
  score: number;
  timeLeft: number;
  phasesCompleted: number;
  totalPhases: number;
  status: GameOutcome["status"];
  date: string;
};

const STORAGE_KEY = "corrida-dos-bits-records";
const MAX_RECORDS = 8;

function sortRecords(records: PlayerRecord[]) {
  return [...records].sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }

    if (a.status !== b.status) {
      return a.status === "victory" ? -1 : 1;
    }

    return b.timeLeft - a.timeLeft;
  });
}

export function getRecords(): PlayerRecord[] {
  try {
    const storedRecords = localStorage.getItem(STORAGE_KEY);
    if (!storedRecords) {
      return [];
    }

    return sortRecords(JSON.parse(storedRecords) as PlayerRecord[]).slice(0, MAX_RECORDS);
  } catch {
    return [];
  }
}

export function saveRecord(name: string, outcome: GameOutcome) {
  const cleanName = name.trim().slice(0, 18) || "Jogador";
  const randomId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const record: PlayerRecord = {
    id: randomId,
    name: cleanName,
    score: outcome.score,
    timeLeft: Math.max(0, Math.ceil(outcome.timeLeft)),
    phasesCompleted: outcome.phasesCompleted,
    totalPhases: outcome.totalPhases,
    status: outcome.status,
    date: new Date().toLocaleDateString("pt-BR"),
  };

  const updatedRecords = sortRecords([record, ...getRecords()]).slice(0, MAX_RECORDS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  return updatedRecords;
}
