// Проверка, умеет ли устройство рисовать эмодзи.
// На старых Android новые эмодзи (Unicode 11+) выводятся квадратом с крестиком —
// для них показываем встроенную SVG-картинку из public/emoji.

const SIZE = 32;
// Символ из частной области Unicode: его нет ни в одном шрифте,
// поэтому он всегда рисуется «квадратом» — с ним и сравниваем.
const MISSING_GLYPH = '\u{10FFFD}';
const REFERENCE_EMOJI = '😀';

const cache = new Map<string, boolean>();

// Имя файла картинки: кодовые точки без вариационного селектора FE0F
export function emojiFileName(emoji: string): string {
  return [...emoji]
    .map(ch => ch.codePointAt(0)!.toString(16))
    .filter(cp => cp !== 'fe0f')
    .join('-') + '.svg';
}

function createContext(): CanvasRenderingContext2D | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.font = `${SIZE * 0.75}px sans-serif`;
    ctx.textBaseline = 'top';
    return ctx;
  } catch {
    return null;
  }
}

function draw(ctx: CanvasRenderingContext2D, text: string): Uint8ClampedArray {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillText(text, 0, 0);
  return ctx.getImageData(0, 0, SIZE, SIZE).data;
}

function sameImage(a: Uint8ClampedArray, b: Uint8ClampedArray): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function detect(emoji: string): boolean {
  const ctx = createContext();
  // Без canvas проверить нельзя — считаем, что эмодзи поддерживается
  if (!ctx) return true;
  try {
    // Неподдержанная ZWJ-последовательность (🧑‍⚕️) распадается на несколько знаков
    // и становится заметно шире одиночного эмодзи
    if (ctx.measureText(emoji).width > ctx.measureText(REFERENCE_EMOJI).width * 1.5) {
      return false;
    }
    return !sameImage(draw(ctx, emoji), draw(ctx, MISSING_GLYPH));
  } catch {
    return true;
  }
}

export function isEmojiSupported(emoji: string): boolean {
  let supported = cache.get(emoji);
  if (supported === undefined) {
    supported = detect(emoji);
    cache.set(emoji, supported);
  }
  return supported;
}

// Для тестов
export function resetEmojiSupportCache(): void {
  cache.clear();
}
