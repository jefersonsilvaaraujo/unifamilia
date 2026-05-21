import { useState } from "react";
import { CodePanel } from "./components/CodePanel";
import { EndScreen } from "./components/EndScreen";
import { GameCanvas } from "./components/GameCanvas";
import { StartScreen } from "./components/StartScreen";
import type { CodeSnippetId } from "./data/codeSnippets";
import { defaultGameMode, type GameMode } from "./data/gameModes";
import { levels } from "./data/levels";
import { playSound, resumeAudio } from "./utils/sound";

type AppStatus = "start" | "playing" | "victory" | "defeat";

export type GameOutcome = {
  status: Extract<AppStatus, "victory" | "defeat">;
  score: number;
  timeLeft: number;
  phasesCompleted: number;
  totalPhases: number;
  modeId: GameMode["id"];
  modeName: string;
  dailySeed?: string;
};

const initialOutcome: GameOutcome = {
  status: "defeat",
  score: 0,
  timeLeft: 0,
  phasesCompleted: 0,
  totalPhases: defaultGameMode.levelCount,
  modeId: defaultGameMode.id,
  modeName: defaultGameMode.name,
};

export default function App() {
  const [status, setStatus] = useState<AppStatus>("start");
  const [activeSnippet, setActiveSnippet] = useState<CodeSnippetId>("move");
  const [outcome, setOutcome] = useState<GameOutcome>(initialOutcome);
  const [selectedMode, setSelectedMode] = useState<GameMode>(defaultGameMode);
  const [round, setRound] = useState(0);

  const startGame = () => {
    void resumeAudio();
    playSound("start");
    setActiveSnippet("move");
    setOutcome({
      ...initialOutcome,
      totalPhases: Math.min(selectedMode.levelCount, levels.length),
      modeId: selectedMode.id,
      modeName: selectedMode.name,
    });
    setRound((currentRound) => currentRound + 1);
    setStatus("playing");
  };

  const finishGame = (nextOutcome: GameOutcome) => {
    setOutcome(nextOutcome);
    setStatus(nextOutcome.status);
  };

  const returnToMainMenu = () => {
    setActiveSnippet("move");
    setStatus("start");
  };

  return (
    <main className="app-shell">
      <section className="game-area">
        {status === "start" && (
          <StartScreen selectedMode={selectedMode} onModeChange={setSelectedMode} onStart={startGame} />
        )}
        {status === "playing" && (
          <GameCanvas key={round} mode={selectedMode} onAction={setActiveSnippet} onGameEnd={finishGame} />
        )}
        {(status === "victory" || status === "defeat") && (
          <EndScreen outcome={outcome} onMainMenu={returnToMainMenu} onRestart={startGame} />
        )}
      </section>

      <CodePanel activeSnippet={activeSnippet} onSelectSnippet={setActiveSnippet} />
    </main>
  );
}
