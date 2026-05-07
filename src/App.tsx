import { useState } from "react";
import { CodePanel } from "./components/CodePanel";
import { EndScreen } from "./components/EndScreen";
import { GameCanvas } from "./components/GameCanvas";
import { StartScreen } from "./components/StartScreen";
import type { CodeSnippetId } from "./data/codeSnippets";
import { levels } from "./data/levels";
import { playSound, resumeAudio } from "./utils/sound";

type AppStatus = "start" | "playing" | "victory" | "defeat";

export type GameOutcome = {
  status: Extract<AppStatus, "victory" | "defeat">;
  score: number;
  timeLeft: number;
  phasesCompleted: number;
  totalPhases: number;
};

const initialOutcome: GameOutcome = {
  status: "defeat",
  score: 0,
  timeLeft: 0,
  phasesCompleted: 0,
  totalPhases: levels.length,
};

export default function App() {
  const [status, setStatus] = useState<AppStatus>("start");
  const [activeSnippet, setActiveSnippet] = useState<CodeSnippetId>("move");
  const [outcome, setOutcome] = useState<GameOutcome>(initialOutcome);
  const [round, setRound] = useState(0);

  const startGame = () => {
    void resumeAudio();
    playSound("start");
    setActiveSnippet("move");
    setOutcome(initialOutcome);
    setRound((currentRound) => currentRound + 1);
    setStatus("playing");
  };

  const finishGame = (nextOutcome: GameOutcome) => {
    setOutcome(nextOutcome);
    setStatus(nextOutcome.status);
  };

  return (
    <main className="app-shell">
      <section className="game-area">
        {status === "start" && <StartScreen onStart={startGame} />}
        {status === "playing" && <GameCanvas key={round} onAction={setActiveSnippet} onGameEnd={finishGame} />}
        {(status === "victory" || status === "defeat") && <EndScreen outcome={outcome} onRestart={startGame} />}
      </section>

      <CodePanel activeSnippet={activeSnippet} onSelectSnippet={setActiveSnippet} />
    </main>
  );
}
