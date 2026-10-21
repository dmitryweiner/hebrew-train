// Картинка слова: эмодзи, которых нет в шрифте устройства, заменяются SVG

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WordImage from '../WordImage';
import { resetEmojiSupportCache } from '../../utils/emojiSupport';

// Имитация canvas на устройстве со шрифтом, где есть только `glyphs`:
// всё остальное рисуется одинаковым «квадратом с крестиком»
function mockDeviceFont(glyphs: string[]) {
  const SIZE = 32;
  const pixelsFor = (text: string) => {
    const data = new Uint8ClampedArray(SIZE * SIZE * 4);
    const seed = glyphs.includes(text) ? text.codePointAt(0)! : 0;
    for (let i = 0; i < data.length; i++) data[i] = (seed + i) % 256;
    return data;
  };
  let last = '';
  const ctx = {
    font: '',
    textBaseline: '',
    clearRect: () => {},
    fillText: (text: string) => { last = text; },
    getImageData: () => ({ data: pixelsFor(last) }),
    // Неизвестная последовательность распадается на отдельные знаки
    measureText: (text: string) => ({
      width: glyphs.includes(text) ? 24 : [...text].filter(c => c !== '\u200d' && c !== '\ufe0f').length * 24,
    }),
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
}

describe('WordImage', () => {
  beforeEach(() => resetEmojiSupportCache());
  afterEach(() => vi.restoreAllMocks());

  it('показывает эмодзи текстом, если шрифт его умеет', () => {
    mockDeviceFont(['😀', '🪑']);
    render(<WordImage emoji="🪑" alt="стул" />);
    expect(screen.getByRole('img', { name: 'стул' })).toHaveTextContent('🪑');
  });

  it('заменяет эмодзи картинкой, если в шрифте его нет', () => {
    mockDeviceFont(['😀']);
    render(<WordImage emoji="🪑" alt="стул" />);
    const img = screen.getByRole('img', { name: 'стул' });
    expect(img).not.toHaveTextContent('🪑');
    expect(img.querySelector('img')).toHaveAttribute('src', './emoji/1fa91.svg');
  });

  it('заменяет картинкой ZWJ-последовательность, которая распалась на части', () => {
    mockDeviceFont(['😀', '🧑', '⚕️']);
    render(<WordImage emoji="🧑‍⚕️" alt="врач" />);
    const img = screen.getByRole('img', { name: 'врач' });
    expect(img.querySelector('img')).toHaveAttribute('src', './emoji/1f9d1-200d-2695.svg');
  });

  it('показывает эмодзи текстом, если canvas недоступен', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    render(<WordImage emoji="🪑" alt="стул" />);
    expect(screen.getByRole('img', { name: 'стул' })).toHaveTextContent('🪑');
  });
});
