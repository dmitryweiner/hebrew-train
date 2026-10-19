// Короткие мягкие сигналы ответа через Web Audio (без файлов, работают оффлайн)

let context: AudioContext | null = null;

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  context ??= new AudioContext();
  return context;
};

const tone = (ctx: AudioContext, frequency: number, start: number, duration: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
};

export const playAnswerSound = (correct: boolean): void => {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
  if (correct) {
    tone(ctx, 660, 0, 0.15);
    tone(ctx, 880, 0.12, 0.22);
  } else {
    tone(ctx, 330, 0, 0.18);
    tone(ctx, 262, 0.15, 0.25);
  }
};
