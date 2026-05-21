import type { GameOutcome } from "../App";
import type { GameModeId } from "../data/gameModes";

export type PlayerRecord = {
  id: string;
  name: string;
  score: number;
  timeLeft: number;
  phasesCompleted: number;
  totalPhases: number;
  status: GameOutcome["status"];
  modeId: GameModeId;
  modeName: string;
  dailySeed?: string;
  date: string;
};

const STORAGE_KEY = "corrida-dos-bits-records";
const MAX_RECORDS = 8;

function sortRecords(records: PlayerRecord[]) {
  return [...records].sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }

    if (a.phasesCompleted !== b.phasesCompleted) {
      return b.phasesCompleted - a.phasesCompleted;
    }

    if (a.status !== b.status) {
      return a.status === "victory" ? -1 : 1;
    }

    return b.timeLeft - a.timeLeft;
  });
}

function normalizeRecord(record: PlayerRecord): PlayerRecord {
  return {
    ...record,
    modeId: record.modeId ?? "infantil",
    modeName: record.modeName ?? "Infantil",
  };
}

function readAllRecords() {
  try {
    const storedRecords = localStorage.getItem(STORAGE_KEY);
    if (!storedRecords) {
      return [];
    }

    return (JSON.parse(storedRecords) as PlayerRecord[]).map(normalizeRecord);
  } catch {
    return [];
  }
}

export function getRecords(modeId?: GameModeId): PlayerRecord[] {
  const records = readAllRecords();
  const filteredRecords = modeId ? records.filter((record) => record.modeId === modeId) : records;
  return sortRecords(filteredRecords).slice(0, MAX_RECORDS);
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
    modeId: outcome.modeId,
    modeName: outcome.modeName,
    dailySeed: outcome.dailySeed,
    date: new Date().toLocaleDateString("pt-BR"),
  };

  const allRecords = [record, ...readAllRecords()];
  const recordsByMode = allRecords.reduce<Record<string, PlayerRecord[]>>((groups, currentRecord) => {
    groups[currentRecord.modeId] ??= [];
    groups[currentRecord.modeId].push(currentRecord);
    return groups;
  }, {});
  const updatedRecords = Object.values(recordsByMode).flatMap((records) => sortRecords(records).slice(0, MAX_RECORDS));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  return getRecords(outcome.modeId);
}
