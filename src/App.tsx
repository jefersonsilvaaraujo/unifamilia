import { useCallback, useEffect, useRef, useState } from "react";
import { CodePanel } from "./components/CodePanel";
import { EndScreen } from "./components/EndScreen";
import { GameCanvas } from "./components/GameCanvas";
import { StartScreen } from "./components/StartScreen";
import type { CodeSnippetId } from "./data/codeSnippets";
import { defaultGameMode, gameModes, type GameMode } from "./data/gameModes";
import { levels } from "./data/levels";
import { emptyGamepadInput, readGamepadInput, wasPressed, type GamepadInput } from "./utils/gamepad";
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
  const [controllerName, setControllerName] = useState("");
  const [round, setRound] = useState(0);
  const previousGamepadInputRef = useRef<GamepadInput>(emptyGamepadInput);
  const lastControllerNameRef = useRef("");

  const startGame = useCallback(() => {
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
  }, [selectedMode]);

  const finishGame = useCallback((nextOutcome: GameOutcome) => {
    setOutcome(nextOutcome);
    setStatus(nextOutcome.status);
  }, []);

  const returnToMainMenu = useCallback(() => {
    setActiveSnippet("move");
    setStatus("start");
  }, []);

  const selectAdjacentMode = useCallback((direction: 1 | -1) => {
    setSelectedMode((currentMode) => {
      const currentIndex = gameModes.findIndex((mode) => mode.id === currentMode.id);
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = (safeIndex + direction + gameModes.length) % gameModes.length;
      return gameModes[nextIndex];
    });
  }, []);

  useEffect(() => {
    const handleGamepadConnected = (event: GamepadEvent) => {
      lastControllerNameRef.current = event.gamepad.id;
      setControllerName(event.gamepad.id);
    };
    const handleGamepadDisconnected = () => {
      lastControllerNameRef.current = "";
      setControllerName("");
      previousGamepadInputRef.current = emptyGamepadInput;
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const tick = () => {
      const gamepadInput = readGamepadInput();
      const previousGamepadInput = previousGamepadInputRef.current;

      if (gamepadInput.connected && gamepadInput.id !== lastControllerNameRef.current) {
        lastControllerNameRef.current = gamepadInput.id;
        setControllerName(gamepadInput.id);
      }

      if (!gamepadInput.connected && lastControllerNameRef.current) {
        lastControllerNameRef.current = "";
        setControllerName("");
      }

      if (status === "start") {
        if (wasPressed(gamepadInput.previous, previousGamepadInput.previous)) {
          selectAdjacentMode(-1);
        }

        if (wasPressed(gamepadInput.next, previousGamepadInput.next)) {
          selectAdjacentMode(1);
        }

        if (wasPressed(gamepadInput.confirm, previousGamepadInput.confirm)) {
          startGame();
        }
      }

      if (status === "victory" || status === "defeat") {
        if (wasPressed(gamepadInput.confirm, previousGamepadInput.confirm)) {
          startGame();
        }

        if (status === "defeat" && wasPressed(gamepadInput.cancel, previousGamepadInput.cancel)) {
          returnToMainMenu();
        }
      }

      previousGamepadInputRef.current = gamepadInput;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [returnToMainMenu, selectAdjacentMode, startGame, status]);

  return (
    <main className="app-shell">
      <section className="game-area">
        {status === "start" && (
          <StartScreen
            controllerName={controllerName}
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
            onStart={startGame}
          />
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
