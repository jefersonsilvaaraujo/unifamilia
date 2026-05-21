import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameOutcome } from "../App";
import type { CodeSnippetId } from "../data/codeSnippets";
import type { GameMode } from "../data/gameModes";
import { GROUND_Y, levels, type Bit, type Bug, type Hazard, type Platform, type Rect } from "../data/levels";
import { getSoundEnabled, playSound, resumeAudio, setSoundEnabled } from "../utils/sound";
import { ScoreBoard } from "./ScoreBoard";

type GameCanvasProps = {
  mode: GameMode;
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

type RuntimeHazard = Hazard & {
  active: boolean;
};

type RuntimePlatform = Platform & {
  active: boolean;
};

type RuntimeLevelState = {
  platforms: Platform[];
  bits: Bit[];
  bugs: Bug[];
  hazards: Hazard[];
};

type GameSnapshot = {
  phaseIndex: number;
  player: Player;
  platforms: RuntimePlatform[];
  bits: Bit[];
  bugs: Bug[];
  hazards: RuntimeHazard[];
  score: number;
  lives: number;
  timeLeft: number;
  cameraX: number;
  message: string;
  shake: boolean;
  soundEnabled: boolean;
  floatingMessages: FloatingMessage[];
  collectedBits: number;
  requiredBits: number;
  combo: number;
  modeName: string;
  dailySeed?: string;
};

const PLAYER_WIDTH = 42;
const PLAYER_HEIGHT = 56;
const MOVE_SPEED = 295;
const JUMP_FORCE = 720;
const GRAVITY = 1900;
const MAX_FALL_SPEED = 900;
const SPAWN_X = 68;
const DAMAGE_SCORE_PENALTY = 15;

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

function cloneHazards(hazards: Hazard[]) {
  return hazards.map((hazard) => {
    if (hazard.type === "laser") {
      return { ...hazard, cycle: { ...hazard.cycle } };
    }

    return { ...hazard };
  });
}

function clonePlatforms(platforms: Platform[]) {
  return platforms.map((platform) => ({
    ...platform,
    cycle: platform.cycle ? { ...platform.cycle } : undefined,
  }));
}

// Colisao retangular usada para bits, bugs, plataformas, obstaculos e chegada.
function isColliding(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function getCenteredCamera(playerX: number, viewportWidth: number, worldWidth: number) {
  const desiredCamera = playerX - viewportWidth * 0.35;
  return Math.max(0, Math.min(desiredCamera, worldWidth - viewportWidth));
}

function getActiveLevels(mode: GameMode) {
  return levels.slice(0, Math.min(mode.levelCount, levels.length));
}

function getDailySeed() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDailySeedLabel(seed: string) {
  return `Diario ${seed}`;
}

function seededUnit(seed: string, key: string) {
  let hash = 2166136261;
  const input = `${seed}:${key}`;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}

function dailyOffset(seed: string, key: string, range: number) {
  return Math.round((seededUnit(seed, key) - 0.5) * range * 2);
}

function supportsCurrentMode(itemModes: Hazard["modes"] | Platform["modes"], mode: GameMode) {
  return !itemModes || itemModes.includes(mode.id);
}

function isCycleActive(cycle: { activeDuration: number; inactiveDuration: number; offset: number }, elapsed: number) {
  const totalDuration = cycle.activeDuration + cycle.inactiveDuration;
  const cycleTime = (elapsed + cycle.offset) % totalDuration;
  return cycleTime < cycle.activeDuration;
}

function isPlatformActive(platform: Platform, elapsed: number) {
  if (platform.variant !== "vanishing" || !platform.cycle) {
    return true;
  }

  return isCycleActive(platform.cycle, elapsed);
}

function getRequiredBits(mode: GameMode, totalBits: number) {
  return Math.ceil(totalBits * mode.portalRequirement.ratio);
}

function getCollectedBits(bits: Bit[]) {
  return bits.filter((bit) => bit.collected).length;
}

function scoreValue(points: number, mode: GameMode) {
  if (!mode.advancedScoring) {
    return points;
  }

  return Math.max(1, Math.round(points * mode.scoreMultiplier));
}

function createRuntimeLevelState(levelIndex: number, mode: GameMode, dailySeed: string): RuntimeLevelState {
  const level = levels[levelIndex];
  const useDailyVariant = mode.dailyVariant;
  const platforms = clonePlatforms(level.platforms).filter((platform) => supportsCurrentMode(platform.modes, mode));
  const hazards = mode.advancedHazards
    ? cloneHazards(level.hazards ?? [])
        .filter((hazard) => supportsCurrentMode(hazard.modes, mode))
        .map((hazard, hazardIndex) => {
          if (useDailyVariant && "cycle" in hazard) {
            return {
              ...hazard,
              cycle: {
                ...hazard.cycle,
                offset: hazard.cycle.offset + seededUnit(dailySeed, `${level.id}-hazard-${hazardIndex}`),
              },
            };
          }

          return hazard;
        })
    : [];

  const bits = cloneBits(level.bits).map((bit, bitIndex) => {
    if (!useDailyVariant) {
      return bit;
    }

    return {
      ...bit,
      x: clamp(bit.x + dailyOffset(dailySeed, `${level.id}-bit-x-${bitIndex}`, 16), 20, level.worldWidth - bit.width - 20),
      y: clamp(bit.y + dailyOffset(dailySeed, `${level.id}-bit-y-${bitIndex}`, 5), 210, GROUND_Y - bit.height - 6),
    };
  });

  const bugs = cloneBugs(level.bugs).map((bug, bugIndex) => {
    const dailySpeed = useDailyVariant ? 0.94 + seededUnit(dailySeed, `${level.id}-bug-speed-${bugIndex}`) * 0.16 : 1;
    const movement = bug.movement
      ? {
          ...bug.movement,
          speed: bug.movement.speed * mode.bugSpeedMultiplier * dailySpeed,
          verticalSpeed: bug.movement.verticalSpeed
            ? bug.movement.verticalSpeed * mode.bugSpeedMultiplier * dailySpeed
            : undefined,
        }
      : undefined;
    const xOffset = useDailyVariant ? dailyOffset(dailySeed, `${level.id}-bug-x-${bugIndex}`, 20) : 0;
    const x = movement
      ? clamp(bug.x + xOffset, movement.minX, movement.maxX - bug.width)
      : clamp(bug.x + xOffset, 0, level.worldWidth - bug.width);

    return {
      ...bug,
      x,
      movement,
    };
  });

  return { platforms, bits, bugs, hazards };
}

function createSnapshot(
  mode: GameMode,
  dailySeed: string,
  phaseIndex: number,
  player: Player,
  state: RuntimeLevelState,
): GameSnapshot {
  const elapsed = 0;
  const requiredBits = getRequiredBits(mode, state.bits.length);

  return {
    phaseIndex,
    player: { ...player },
    platforms: state.platforms.map((platform) => ({ ...platform, active: isPlatformActive(platform, elapsed) })),
    bits: state.bits.map((bit) => ({ ...bit })),
    bugs: cloneBugs(state.bugs),
    hazards: state.hazards.map((hazard) => ({
      ...hazard,
      active: hazard.type !== "laser" || isCycleActive(hazard.cycle, elapsed),
    })),
    score: 0,
    lives: mode.startingLives,
    timeLeft: mode.startTime,
    cameraX: 0,
    message: levels[phaseIndex].hint,
    shake: false,
    soundEnabled: getSoundEnabled(),
    floatingMessages: [],
    collectedBits: 0,
    requiredBits,
    combo: 0,
    modeName: mode.name,
    dailySeed: mode.dailyVariant ? getDailySeedLabel(dailySeed) : undefined,
  };
}

export function GameCanvas({ mode, onAction, onGameEnd }: GameCanvasProps) {
  const activeLevels = useMemo(() => getActiveLevels(mode), [mode]);
  const dailySeedRef = useRef(getDailySeed());
  const initialRuntimeState = createRuntimeLevelState(0, mode, dailySeedRef.current);
  const viewportRef = useRef<HTMLDivElement>(null);
  const phaseIndexRef = useRef(0);
  const playerRef = useRef<Player>(createPlayer());
  const platformsRef = useRef<Platform[]>(initialRuntimeState.platforms);
  const bitsRef = useRef<Bit[]>(initialRuntimeState.bits);
  const bugsRef = useRef<Bug[]>(initialRuntimeState.bugs);
  const hazardsRef = useRef<Hazard[]>(initialRuntimeState.hazards);
  const keysRef = useRef(new Set<string>());
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(mode.startingLives);
  const timeLeftRef = useRef(mode.startTime);
  const endedRef = useRef(false);
  const jumpRequestedRef = useRef(false);
  const damageCooldownRef = useRef(0);
  const messageTtlRef = useRef(2);
  const messageRef = useRef(activeLevels[0].hint);
  const floatingMessagesRef = useRef<FloatingMessage[]>([]);
  const lastActionRef = useRef(0);
  const lastStepSoundRef = useRef(0);
  const viewportWidthRef = useRef(960);
  const elapsedRef = useRef(0);
  const comboRef = useRef(0);
  const phaseDamageRef = useRef(0);
  const portalDeniedCooldownRef = useRef(0);
  const zoneMessageCooldownRef = useRef(0);

  const [snapshot, setSnapshot] = useState<GameSnapshot>(() =>
    createSnapshot(mode, dailySeedRef.current, 0, playerRef.current, initialRuntimeState),
  );
  const currentLevel = activeLevels[snapshot.phaseIndex] ?? activeLevels[0];

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
      const nextLevel = activeLevels[nextPhaseIndex];
      const runtimeState = createRuntimeLevelState(nextLevel.id - 1, mode, dailySeedRef.current);

      phaseIndexRef.current = nextPhaseIndex;
      platformsRef.current = runtimeState.platforms;
      bitsRef.current = runtimeState.bits;
      bugsRef.current = runtimeState.bugs;
      hazardsRef.current = runtimeState.hazards;
      phaseDamageRef.current = 0;
      resetPlayerToStart(0.8);
    },
    [activeLevels, mode, resetPlayerToStart],
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
        phasesCompleted: status === "victory" ? activeLevels.length : phaseIndexRef.current,
        totalPhases: activeLevels.length,
        modeId: mode.id,
        modeName: mode.name,
        dailySeed: mode.dailyVariant ? getDailySeedLabel(dailySeedRef.current) : undefined,
      });
    },
    [activeLevels.length, mode, onGameEnd, setTeachingAction],
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

    const addScore = (points: number, x: number, y: number, label: string) => {
      scoreRef.current += points;
      addFloatingMessage(x, y, label);
    };

    const advancePhase = () => {
      const completedLevel = activeLevels[phaseIndexRef.current];
      const nextPhaseIndex = phaseIndexRef.current + 1;
      const nextLevel = activeLevels[nextPhaseIndex];
      const collectedBits = getCollectedBits(bitsRef.current);
      const allBitsCollected = collectedBits === bitsRef.current.length;
      const noDamageBonus = phaseDamageRef.current === 0;
      const basePhaseScore = mode.advancedScoring
        ? 25 + (allBitsCollected ? 25 : 0) + (noDamageBonus ? 20 : 0) + Math.ceil(timeLeftRef.current * 0.2)
        : 25;
      const phaseScore = scoreValue(basePhaseScore, mode);
      const timeBonus = Math.round(completedLevel.timeBonus * mode.timeBonusMultiplier);

      scoreRef.current += phaseScore;
      timeLeftRef.current = Math.min(timeLeftRef.current + timeBonus, mode.maxTimeAfterBonus);
      loadPhase(nextPhaseIndex);
      showMessage(`Fase ${nextLevel.id}! ${nextLevel.hint} +${timeBonus}s`, 2);
      addFloatingMessage(SPAWN_X + 20, GROUND_Y - 95, `+${phaseScore} fase`);
      setTeachingAction(mode.advancedScoring ? "score" : "win");
      playSound("phase");
    };

    const tick = (timestamp: number) => {
      if (endedRef.current) {
        return;
      }

      // requestAnimationFrame entrega o tempo entre quadros; isso mantem o movimento estavel.
      const lastFrame = lastFrameRef.current ?? timestamp;
      const delta = Math.min((timestamp - lastFrame) / 1000, 0.033);
      lastFrameRef.current = timestamp;
      elapsedRef.current += delta;

      let level = activeLevels[phaseIndexRef.current];
      const keys = keysRef.current;
      const player = playerRef.current;
      const movingLeft = keys.has("ArrowLeft") || keys.has("KeyA");
      const movingRight = keys.has("ArrowRight") || keys.has("KeyD");
      const direction = Number(movingRight) - Number(movingLeft);
      const previousBottom = player.y + player.height;

      portalDeniedCooldownRef.current = Math.max(0, portalDeniedCooldownRef.current - delta);
      zoneMessageCooldownRef.current = Math.max(0, zoneMessageCooldownRef.current - delta);

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

        if (
          bug.movement.verticalSpeed &&
          bug.movement.minY !== undefined &&
          bug.movement.maxY !== undefined &&
          bug.movement.verticalDirection
        ) {
          bug.y += bug.movement.verticalSpeed * bug.movement.verticalDirection * delta;

          if (bug.y <= bug.movement.minY) {
            bug.y = bug.movement.minY;
            bug.movement.verticalDirection = 1;
          }

          if (bug.y + bug.height >= bug.movement.maxY) {
            bug.y = bug.movement.maxY - bug.height;
            bug.movement.verticalDirection = -1;
          }
        }
      }

      const activeSlowZone = hazardsRef.current.find(
        (hazard) => hazard.type === "slow-zone" && isColliding(player, hazard),
      );
      const movementMultiplier = activeSlowZone?.type === "slow-zone" ? activeSlowZone.speedMultiplier : 1;

      if (activeSlowZone && zoneMessageCooldownRef.current === 0) {
        showMessage("Zona de lag: velocidade reduzida.", 0.9);
        zoneMessageCooldownRef.current = 1.4;
        setTeachingAction("hazards");
      }

      player.velocityX = direction * MOVE_SPEED * movementMultiplier;
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

      const activePlatforms = platformsRef.current.filter((platform) => isPlatformActive(platform, elapsedRef.current));

      // Aterrissagem: o robo so encaixa na plataforma quando vem de cima.
      for (const platform of activePlatforms) {
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

      // Coletar bits altera pontuacao, feedback visual, som e o trecho didatico no painel.
      for (const bit of bitsRef.current) {
        if (!bit.collected && isColliding(player, bit)) {
          bit.collected = true;
          comboRef.current += 1;
          const comboBonus = mode.advancedScoring ? Math.min(comboRef.current - 1, 8) * 2 : 0;
          const collectScore = scoreValue(10 + comboBonus, mode);
          addScore(collectScore, bit.x, bit.y, `+${collectScore}`);
          showMessage(mode.advancedScoring ? `+${collectScore} bits! Combo ${comboRef.current}` : "+10 bits!");
          playSound("collect");
          setTeachingAction(mode.advancedScoring ? "score" : "collect");
        }
      }

      for (const hazard of hazardsRef.current) {
        if (hazard.type !== "trap-bit" || hazard.collected || !isColliding(player, hazard)) {
          continue;
        }

        hazard.collected = true;
        comboRef.current = 0;
        timeLeftRef.current = Math.max(0, timeLeftRef.current - hazard.penaltySeconds);
        scoreRef.current = Math.max(0, scoreRef.current - scoreValue(hazard.scorePenalty, mode));
        showMessage(`Bit falso: -${hazard.penaltySeconds}s e combo zerado.`, 1.4);
        addFloatingMessage(hazard.x, hazard.y, `-${hazard.penaltySeconds}s`);
        playSound("collision");
        setTeachingAction("hazards");
      }

      damageCooldownRef.current = Math.max(0, damageCooldownRef.current - delta);

      if (damageCooldownRef.current === 0) {
        const hitBug = bugsRef.current.find((bug) => isColliding(player, bug));
        const hitLaser = hazardsRef.current.find(
          (hazard) =>
            hazard.type === "laser" && isCycleActive(hazard.cycle, elapsedRef.current) && isColliding(player, hazard),
        );

        if (hitBug || hitLaser) {
          livesRef.current -= 1;
          phaseDamageRef.current += 1;
          comboRef.current = 0;

          if (mode.advancedScoring) {
            scoreRef.current = Math.max(0, scoreRef.current - scoreValue(DAMAGE_SCORE_PENALTY, mode));
          }

          const obstacleMessage = hitBug ? `Bug nivel ${hitBug.level}` : "Firewall ativo";
          showMessage(`${obstacleMessage}! Voce voltou ao inicio.`);
          addFloatingMessage(player.x, player.y - 16, "-1 vida");
          playSound("collision");
          setTeachingAction(hitLaser ? "hazards" : "collision");

          if (livesRef.current <= 0) {
            finishGame("defeat");
            return;
          }

          resetPlayerToStart(1.2);
        }
      }

      const collectedBits = getCollectedBits(bitsRef.current);
      const requiredBits = getRequiredBits(mode, bitsRef.current.length);

      // Portais intermediarios carregam a proxima fase sem parar a partida.
      if (player.x + player.width >= level.portalX) {
        if (collectedBits < requiredBits) {
          player.x = level.portalX - player.width - 4;
          player.velocityX = 0;

          if (portalDeniedCooldownRef.current === 0) {
            const remainingBits = requiredBits - collectedBits;
            showMessage(`Portal bloqueado: faltam ${remainingBits} bits obrigatorios.`, 1.4);
            portalDeniedCooldownRef.current = 1;
            setTeachingAction("difficulty");
          }
        } else if (phaseIndexRef.current < activeLevels.length - 1) {
          advancePhase();
          level = activeLevels[phaseIndexRef.current];
        } else {
          const victoryBonus = mode.advancedScoring ? scoreValue(Math.ceil(timeLeftRef.current * 0.6), mode) : 0;
          if (victoryBonus > 0) {
            scoreRef.current += victoryBonus;
            addFloatingMessage(player.x, player.y - 28, `+${victoryBonus} tempo`);
          }

          showMessage("Portal final alcancado!");
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
        platforms: platformsRef.current.map((platform) => ({
          ...platform,
          active: isPlatformActive(platform, elapsedRef.current),
        })),
        bits: bitsRef.current.map((bit) => ({ ...bit })),
        bugs: cloneBugs(bugsRef.current),
        hazards: hazardsRef.current.map((hazard) => ({
          ...hazard,
          active: hazard.type !== "laser" || isCycleActive(hazard.cycle, elapsedRef.current),
        })),
        score: scoreRef.current,
        lives: livesRef.current,
        timeLeft: timeLeftRef.current,
        cameraX,
        message: messageRef.current,
        shake: damageCooldownRef.current > 0.75,
        soundEnabled: getSoundEnabled(),
        floatingMessages: floatingMessagesRef.current.map((message) => ({ ...message })),
        collectedBits,
        requiredBits,
        combo: comboRef.current,
        modeName: mode.name,
        dailySeed: mode.dailyVariant ? getDailySeedLabel(dailySeedRef.current) : undefined,
      });

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeLevels, finishGame, loadPhase, mode, resetPlayerToStart, setTeachingAction, showMessage]);

  return (
    <section className="game-shell" aria-label="Area do jogo Corrida dos Bits">
      <div className="game-top-row">
        <ScoreBoard
          score={snapshot.score}
          lives={snapshot.lives}
          timeLeft={snapshot.timeLeft}
          phase={snapshot.phaseIndex + 1}
          totalPhases={activeLevels.length}
          modeName={snapshot.modeName}
          collectedBits={snapshot.collectedBits}
          requiredBits={snapshot.requiredBits}
          totalBits={snapshot.bits.length}
          combo={snapshot.combo}
        />
        <button className="sound-toggle" type="button" onClick={toggleSound}>
          {snapshot.soundEnabled ? "Som ligado" : "Som desligado"}
        </button>
      </div>

      <div className={snapshot.shake ? "game-stage is-shaking" : "game-stage"} ref={viewportRef}>
        <div className="phase-banner">
          <strong>
            {currentLevel.title} - {mode.shortName}
          </strong>
          <span>{currentLevel.hint}</span>
          {snapshot.dailySeed && <small>{snapshot.dailySeed}</small>}
        </div>

        <div
          className="game-world"
          style={{ width: currentLevel.worldWidth, transform: `translateX(${-snapshot.cameraX}px)` }}
        >
          <div className="sky-grid" />

          {snapshot.platforms.map((platform, index) => (
            <div
              className={[
                index === 0 ? "platform ground" : "platform",
                platform.variant === "vanishing" ? "is-vanishing" : "",
                platform.active ? "" : "is-inactive",
              ]
                .filter(Boolean)
                .join(" ")}
              key={`${snapshot.phaseIndex}-${platform.x}-${platform.y}`}
              style={{
                left: platform.x,
                top: platform.y,
                width: platform.width,
                height: platform.height,
              }}
            />
          ))}

          {snapshot.hazards.map((hazard) => {
            if (hazard.type === "trap-bit" && hazard.collected) {
              return null;
            }

            return (
              <div
                className={`hazard hazard-${hazard.type} ${hazard.active ? "is-active" : "is-inactive"}`}
                key={`${hazard.type}-${hazard.id}`}
                style={{
                  left: hazard.x,
                  top: hazard.y,
                  width: hazard.width,
                  height: hazard.height,
                }}
                aria-label={hazard.type === "trap-bit" ? "Bit falso" : hazard.label}
              >
                <span>{hazard.type === "trap-bit" ? hazard.label : hazard.label}</span>
              </div>
            );
          })}

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
              aria-label={`Bug nivel ${bug.level}`}
            >
              {bug.label}
            </div>
          ))}

          <div className="portal" style={{ left: currentLevel.portalX, top: GROUND_Y - 104 }} aria-label="Portal">
            <span>{snapshot.phaseIndex === activeLevels.length - 1 ? "fim" : `fase ${snapshot.phaseIndex + 2}`}</span>
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
            aria-label="Personagem robo"
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
