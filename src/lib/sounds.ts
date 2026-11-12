/** The sounds the game can make. */
export type SoundName = "select" | "play" | "turn" | "over";

type Tone = {
  frequency: number;
  start: number;
  duration: number;
  type?: OscillatorType;
};

const MAX_GAIN = 0.12;

const ATTACK = 0.01;

const SILENCE = 0.0001;

const SCALE = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19];

const RANGE_DB = 24;

const note = (semitonesFromC5: number): number =>
  523.25 * 2 ** (semitonesFromC5 / 12);

const SOUNDS: Record<SoundName, (step: number) => Tone[]> = {
  select: (step) => [
    {
      frequency: note(SCALE[Math.min(step, SCALE.length - 1)]),
      start: 0,
      duration: 0.09,
    },
  ],
  play: () => [
    { frequency: note(0), start: 0, duration: 0.12, type: "triangle" },
    { frequency: note(4), start: 0.07, duration: 0.12, type: "triangle" },
    { frequency: note(7), start: 0.14, duration: 0.2, type: "triangle" },
  ],
  turn: () => [
    { frequency: note(4), start: 0, duration: 0.14 },
    { frequency: note(9), start: 0.12, duration: 0.24 },
  ],
  over: () => [
    { frequency: note(0), start: 0, duration: 0.2, type: "triangle" },
    { frequency: note(4), start: 0.16, duration: 0.2, type: "triangle" },
    { frequency: note(7), start: 0.32, duration: 0.2, type: "triangle" },
    { frequency: note(12), start: 0.48, duration: 0.5, type: "triangle" },
  ],
};

let context: AudioContext | null = null;

const getContext = (): AudioContext | null => {
  if (typeof AudioContext === "undefined") return null;
  try {
    context ??= new AudioContext();
  } catch {
    return null;
  }
  if (context.state === "suspended") void context.resume();
  return context;
};

const playTone = (audio: AudioContext, tone: Tone, volume: number): void => {
  const peak = Math.max(
    MAX_GAIN * 10 ** ((-(1 - volume) * RANGE_DB) / 20),
    SILENCE * 2,
  );
  const startAt = audio.currentTime + tone.start;
  const endAt = startAt + tone.duration;

  const oscillator = audio.createOscillator();
  oscillator.type = tone.type ?? "sine";
  oscillator.frequency.value = tone.frequency;

  const gain = audio.createGain();
  gain.gain.setValueAtTime(SILENCE, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + ATTACK);
  gain.gain.exponentialRampToValueAtTime(SILENCE, endAt);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.02);
};

export const playSound = (name: SoundName, step = 0, volume = 1): void => {
  if (volume <= 0) return;
  const audio = getContext();
  if (audio === null) return;
  for (const tone of SOUNDS[name](step)) playTone(audio, tone, volume);
};
