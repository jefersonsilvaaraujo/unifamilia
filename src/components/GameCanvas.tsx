import { useCallback, useEffect, useRef, useState } from "react";
import type { CodeSnippetId } from "../data/codeSnippets";
import { GROUND_Y, levels, type Bit, type Bug, type Rect } from "../data/levels";
import type { GameOutcome } from "../App";
import { getSoundEnabled, playSound, resumeAudio, setSoundEnabled } from "../utils/sound";
import { ScoreBoard } from "./ScoreBoard";

type GameCanvasProps = {
  onAction: (snippet: CodeSnippetId) => void;
  onGameEnd: (outcome: GameOutcome) => void;
};

type Player = Rect & {
  velocityX: number;
  velocityY: number;
  onGround: boolean;
};

type FloatingMessage = {
  id: number;
  x: number;
  y: number;
  text: string;
  ttl: number;
};

type GameSnapshot = {
  phaseIndex: number;
  player: Player;
  bits: Bit[];
  bugs: Bug[];
  score: number;
  lives: number;
  timeLeft: number;
  cameraX: number;
  message: string;
  shake: boolean;
  soundEnabled: boolean;
  floatingMessages: FloatingMessage[];
};

const PLAYER_WIDTH = 42;
const PLAYER_HEIGHT = 56;
const MOVE_SPEED = 295;
const JUMP_FORCE = 720;
const GRAVITY = 1900;
const MAX_FALL_SPEED = 900;
const START_TIME = 70;
const STARTING_LIVES = 3;
const SPAWN_X = 68;
const MAX_TIME_AFTER_BONUS = 95;

function createPlayer(): Player {
  return {
    x: SPAWN_X,
    y: GROUND_Y - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
  };
}

function cloneBits(bits: Bit[]) {
  return bits.map((bit) => ({ ...bit }));
}

function cloneBugs(bugs: Bug[]) {
  return bugs.map((bug) => ({
    ...bug,
    movement: bug.movement ? { ...bug.movement } : undefined,
  }));
}

// Colisão retangular usada para bits, bugs, plataformas e chegada.
function isColliding(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function getCenteredCamera(playerX: number, viewportWidth: number, worldWidth: number) {
  const desiredCamera = playerX - viewportWidth * 0.35;
  return Math.max(0, Math.min(desiredCamera, worldWidth - viewportWidth));
}

function createInitialSnapshot(): GameSnapshot {
  return {
    phaseIndex: 0,
    player: createPlayer(),
    bits: cloneBits(levels[0].bits),
    bugs: cloneBugs(levels[0].bugs),
    score: 0,
    lives: STARTING_LIVES,
    timeLeft: START_TIME,
    cameraX: 0,
    message: levels[0].hint,
    shake: false,
    soundEnabled: getSoundEnabled(),
    floatingMessages: [],
  };
}

export function GameCanvas({ onAction, onGameEnd }: GameCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const phaseIndexRef = useRef(0);
  const playerRef = useRef<Player>(createPlayer());
  const bitsRef = useRef<Bit[]>(cloneBits(levels[0].bits));
  const bugsRef = useRef<Bug[]>(cloneBugs(levels[0].bugs));
  const keysRef = useRef(new Set<string>());
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);
  const timeLeftRef = useRef(START_TIME);
  const endedRef = useRef(false);
  const jumpRequestedRef = useRef(false);
  const damageCooldownRef = useRef(0);
  const messageTtlRef = useRef(2);
  const messageRef = useRef(levels[0].hint);
  const floatingMessagesRef = useRef<FloatingMessage[]>([]);
  const lastActionRef = useRef(0);
  const lastStepSoundRef = useRef(0);
  const viewportWidthRef = useRef(960);

  const [snapshot, setSnapshot] = useState<GameSnapshot>(createInitialSnapshot);
  const currentLevel = levels[snapshot.phaseIndex];

  const setTeachingAction = useCallback(
    (snippet: CodeSnippetId) => {
      const now = performance.now();
      if (snippet !== "move" || now - lastActionRef.current > 600) {
        onAction(snippet);
        lastActionRef.current = now;
      }
    },
    [onAction],
  );

  const showMessage = useCallback((text: string, duration = 1.3) => {
    messageRef.current = text;
    messageTtlRef.current = duration;
  }, []);

  const resetPlayerToStart = useCallback((invulnerableSeconds = 0) => {
    const player = playerRef.current;
    player.x = SPAWN_X;
    player.y = GROUND_Y - PLAYER_HEIGHT;
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;
    damageCooldownRef.current = invulnerableSeconds;
  }, []);

  const loadPhase = useCallback(
    (nextPhaseIndex: number) => {
      const nextLevel = levels[nextPhaseIndex];
      phaseIndexRef.current = nextPhaseIndex;
      bitsRef.current = cloneBits(nextLevel.bits);
      bugsRef.current = cloneBugs(nextLevel.bugs);
      resetPlayerToStart(0.8);
    },
    [resetPlayerToStart],
  );

  const finishGame = useCallback(
    (status: GameOutcome["status"]) => {
      if (endedRef.current) {
        return;
      }

      endedRef.current = true;
      playSound(status);

      if (status === "victory") {
        setTeachingAction("win");
      }

      onGameEnd({
        status,
        score: scoreRef.current,
        timeLeft: Math.max(0, timeLeftRef.current),
        phasesCompleted: status === "victory" ? levels.length : phaseIndexRef.current,
        totalPhases: levels.length,
      });
    },
    [onGameEnd, setTeachingAction],
  );

  const toggleSound = () => {
    const nextSoundState = !getSoundEnabled();
    setSoundEnabled(nextSoundState);

    if (nextSoundState) {
      void resumeAudio();
      playSound("start");
    }

    setSnapshot((currentSnapshot) => ({
      ...currentSnapshot,
      soundEnabled: nextSoundState,
    }));
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      viewportWidthRef.current = entry.contentRect.width;
    });

    resizeObserver.observe(viewport);
    viewportWidthRef.current = viewport.clientWidth;

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const allowedKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyA", "KeyD", "KeyW"];

      if (allowedKeys.includes(event.code)) {
        event.preventDefault();
        void resumeAudio();
        keysRef.current.add(event.code);
      }

      if ((event.code === "ArrowUp" || event.code === "Space" || event.code === "KeyW") && !event.repeat) {
        jumpRequestedRef.current = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const addFloatingMessage = (x: number, y: number, text: string) => {
      floatingMessagesRef.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        text,
        ttl: 0.9,
      });
    };

    const advancePhase = () => {
      const completedLevel = levels[phaseIndexRef.current];
      const nextPhaseIndex = phaseIndexRef.current + 1;
      const nextLevel = levels[nextPhaseIndex];

      scoreRef.current += 25;
      timeLeftRef.current = Math.min(timeLeftRef.current + completedLevel.timeBonus, MAX_TIME_AFTER_BONUS);
      loadPhase(nextPhaseIndex);
      showMessage(`Fase ${nextLevel.id}! ${nextLevel.hint} +${completedLevel.timeBonus}s`, 2);
      addFloatingMessage(SPAWN_X + 20, GROUND_Y - 95, "+25 fase");
      setTeachingAction("win");
      playSound("phase");
    };

    const tick = (timestamp: number) => {
      if (endedRef.current) {
        return;
      }

      // requestAnimationFrame entrega o tempo entre quadros; isso mantém o movimento estável.
      const lastFrame = lastFrameRef.current ?? timestamp;
      const delta = Math.min((timestamp - lastFrame) / 1000, 0.033);
      lastFrameRef.current = timestamp;

      let level = levels[phaseIndexRef.current];
      const keys = keysRef.current;
      const player = playerRef.current;
      const movingLeft = keys.has("ArrowLeft") || keys.has("KeyA");
      const movingRight = keys.has("ArrowRight") || keys.has("KeyD");
      const direction = Number(movingRight) - Number(movingLeft);
      const previousBottom = player.y + player.height;

      for (const bug of bugsRef.current) {
        if (!bug.movement) {
          continue;
        }

        bug.x += bug.movement.speed * bug.movement.direction * delta;

        if (bug.x <= bug.movement.minX) {
          bug.x = bug.movement.minX;
          bug.movement.direction = 1;
        }

        if (bug.x + bug.width >= bug.movement.maxX) {
          bug.x = bug.movement.maxX - bug.width;
          bug.movement.direction = -1;
        }
      }

      player.velocityX = direction * MOVE_SPEED;
      player.x += player.velocityX * delta;
      player.x = Math.max(0, Math.min(player.x, level.worldWidth - player.width));

      if (direction !== 0) {
        setTeachingAction("move");

        if (player.onGround && timestamp - lastStepSoundRef.current > 240) {
          playSound("move");
          lastStepSoundRef.current = timestamp;
        }
      }

      if (jumpRequestedRef.current && player.onGround) {
        player.velocityY = -JUMP_FORCE;
        player.onGround = false;
        showMessage("Pulo executado!");
        playSound("jump");
        setTeachingAction("jump");
      }

      jumpRequestedRef.current = false;
      player.velocityY = Math.min(player.velocityY + GRAVITY * delta, MAX_FALL_SPEED);
      player.y += player.velocityY * delta;
      player.onGround = false;

      // Aterrissagem: o robô só encaixa na plataforma quando vem de cima.
      for (const platform of level.platforms) {
        const isLanding =
          player.velocityY >= 0 &&
          previousBottom <= platform.y &&
          player.y + player.height >= platform.y &&
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width;

        if (isLanding) {
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.onGround = true;
        }
      }

      // Coletar bits altera pontuação, feedback visual, som e o trecho didático no painel.
      for (const bit of bitsRef.current) {
        if (!bit.collected && isColliding(player, bit)) {
          bit.collected = true;
          scoreRef.current += 10;
          showMessage("+10 bits!");
          addFloatingMessage(bit.x, bit.y, "+10");
          playSound("collect");
          setTeachingAction("collect");
        }
      }

      damageCooldownRef.current = Math.max(0, damageCooldownRef.current - delta);

      if (damageCooldownRef.current === 0) {
        const hitObstacle = bugsRef.current.find((bug) => isColliding(player, bug));

        if (hitObstacle) {
          livesRef.current -= 1;
          showMessage(`Bug nível ${hitObstacle.level}! Você voltou ao início.`);
          addFloatingMessage(player.x, player.y - 16, "-1 vida");
          playSound("collision");
          setTeachingAction("collision");

          if (livesRef.current <= 0) {
            finishGame("defeat");
            return;
          }

          resetPlayerToStart(1.2);
        }
      }

      // Portais intermediários carregam a próxima fase sem parar a partida.
      if (player.x + player.width >= level.portalX) {
        if (phaseIndexRef.current < levels.length - 1) {
          advancePhase();
          level = levels[phaseIndexRef.current];
        } else {
          showMessage("Portal final alcançado!");
          finishGame("victory");
          return;
        }
      }

      timeLeftRef.current -= delta;
      if (timeLeftRef.current <= 0) {
        showMessage("O tempo acabou.");
        finishGame("defeat");
        return;
      }

      messageTtlRef.current = Math.max(0, messageTtlRef.current - delta);
      if (messageTtlRef.current === 0) {
        messageRef.current = level.hint;
      }

      floatingMessagesRef.current = floatingMessagesRef.current
        .map((message) => ({ ...message, y: message.y - 28 * delta, ttl: message.ttl - delta }))
        .filter((message) => message.ttl > 0);

      const viewportWidth = viewportWidthRef.current || 960;
      const cameraX = getCenteredCamera(player.x, viewportWidth, level.worldWidth);

      setSnapshot({
        phaseIndex: phaseIndexRef.current,
        player: { ...player },
        bits: bitsRef.current.map((bit) => ({ ...bit })),
        bugs: cloneBugs(bugsRef.current),
        score: scoreRef.current,
        lives: livesRef.current,
        timeLeft: timeLeftRef.current,
        cameraX,
        message: messageRef.current,
        shake: damageCooldownRef.current > 0.75,
        soundEnabled: getSoundEnabled(),
        floatingMessages: floatingMessagesRef.current.map((message) => ({ ...message })),
      });

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [finishGame, loadPhase, resetPlayerToStart, setTeachingAction, showMessage]);

  return (
    <section className="game-shell" aria-label="Área do jogo Corrida dos Bits">
      <div className="game-top-row">
        <ScoreBoard
          score={snapshot.score}
          lives={snapshot.lives}
          timeLeft={snapshot.timeLeft}
          phase={snapshot.phaseIndex + 1}
          totalPhases={levels.length}
        />
        <button className="sound-toggle" type="button" onClick={toggleSound}>
          {snapshot.soundEnabled ? "Som ligado" : "Som desligado"}
        </button>
      </div>

      <div className={snapshot.shake ? "game-stage is-shaking" : "game-stage"} ref={viewportRef}>
        <div className="phase-banner">
          <strong>{currentLevel.title}</strong>
          <span>{currentLevel.hint}</span>
        </div>

        <div
          className="game-world"
          style={{ width: currentLevel.worldWidth, transform: `translateX(${-snapshot.cameraX}px)` }}
        >
          <div className="sky-grid" />

          {currentLevel.platforms.map((platform, index) => (
            <div
              className={index === 0 ? "platform ground" : "platform"}
              key={`${snapshot.phaseIndex}-${platform.x}-${platform.y}`}
              style={{
                left: platform.x,
                top: platform.y,
                width: platform.width,
                height: platform.height,
              }}
            />
          ))}

          {snapshot.bits.map(
            (bit) =>
              !bit.collected && (
                <div
                  className="bit"
                  key={bit.id}
                  style={{
                    left: bit.x,
                    top: bit.y,
                    width: bit.width,
                    height: bit.height,
                  }}
                  aria-label={`Bit ${bit.label}`}
                >
                  {bit.label}
                </div>
              ),
          )}

          {snapshot.bugs.map((bug) => (
            <div
              className={`bug bug-level-${bug.level} ${bug.movement ? "is-moving" : ""}`}
              key={bug.id}
              style={{
                left: bug.x,
                top: bug.y,
                width: bug.width,
                height: bug.height,
              }}
              aria-label={`Bug nível ${bug.level}`}
            >
              {bug.label}
            </div>
          ))}

          <div className="portal" style={{ left: currentLevel.portalX, top: GROUND_Y - 104 }} aria-label="Portal">
            <span>{snapshot.phaseIndex === levels.length - 1 ? "fim" : `fase ${snapshot.phaseIndex + 2}`}</span>
          </div>

          {snapshot.floatingMessages.map((floatingMessage) => (
            <div
              className="floating-message"
              key={floatingMessage.id}
              style={{
                left: floatingMessage.x,
                top: floatingMessage.y,
              }}
            >
              {floatingMessage.text}
            </div>
          ))}

          <div
            className={snapshot.player.velocityX < 0 ? "player is-left" : "player"}
            style={{
              left: snapshot.player.x,
              top: snapshot.player.y,
              width: snapshot.player.width,
              height: snapshot.player.height,
            }}
            aria-label="Personagem robô"
          >
            <span className="player-eye left-eye" />
            <span className="player-eye right-eye" />
            <span className="player-screen">01</span>
          </div>
        </div>
      </div>

      <div className="game-message" aria-live="polite">
        {snapshot.message}
      </div>
    </section>
  );
}
