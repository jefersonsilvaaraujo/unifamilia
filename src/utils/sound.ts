type SoundName = "start" | "move" | "jump" | "collect" | "collision" | "phase" | "victory" | "defeat";

let audioContext: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass =
    window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  audioContext ??= new AudioContextClass();
  return audioContext;
}

function playTone(frequency: number, duration: number, startDelay = 0, type: OscillatorType = "sine", volume = 0.08) {
  const context = getAudioContext();

  if (!context || !soundEnabled) {
    return;
  }

  const startTime = context.currentTime + startDelay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
}

export async function resumeAudio() {
  const context = getAudioContext();

  if (context?.state === "suspended") {
    await context.resume().catch(() => undefined);
  }
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function getSoundEnabled() {
  return soundEnabled;
}

export function playSound(sound: SoundName) {
  if (!soundEnabled) {
    return;
  }

  void resumeAudio();

  switch (sound) {
    case "start":
      playTone(392, 0.08, 0, "triangle", 0.07);
      playTone(523, 0.1, 0.08, "triangle", 0.07);
      break;
    case "move":
      playTone(210, 0.035, 0, "square", 0.025);
      break;
    case "jump":
      playTone(430, 0.08, 0, "triangle", 0.075);
      playTone(690, 0.1, 0.055, "triangle", 0.06);
      break;
    case "collect":
      playTone(880, 0.06, 0, "sine", 0.08);
      playTone(1175, 0.09, 0.06, "sine", 0.07);
      break;
    case "collision":
      playTone(150, 0.16, 0, "sawtooth", 0.08);
      playTone(95, 0.18, 0.08, "sawtooth", 0.06);
      break;
    case "phase":
      playTone(523, 0.08, 0, "triangle", 0.075);
      playTone(659, 0.08, 0.08, "triangle", 0.075);
      playTone(784, 0.14, 0.16, "triangle", 0.075);
      break;
    case "victory":
      playTone(523, 0.09, 0, "triangle", 0.075);
      playTone(659, 0.09, 0.1, "triangle", 0.075);
      playTone(784, 0.09, 0.2, "triangle", 0.075);
      playTone(1046, 0.18, 0.3, "triangle", 0.075);
      break;
    case "defeat":
      playTone(330, 0.12, 0, "sawtooth", 0.065);
      playTone(247, 0.14, 0.13, "sawtooth", 0.06);
      playTone(196, 0.18, 0.28, "sawtooth", 0.055);
      break;
  }
}
