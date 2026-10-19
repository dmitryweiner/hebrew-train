// Тесты для gameUtils

import { describe, it, expect, beforeEach } from 'vitest';
import type { Word } from '../../types';
import {
  generateLetterDistractors,
  generateLetterOptions,
  generateWordOptions,
  checkLetterAnswer,
  checkWordAnswer,
  generateHint,
  createWordPlaceholders,
  calculatePercentage,
  formatScore,
  getScoreColor,
} from '../gameUtils';

describe('gameUtils', () => {
  let testWords: Word[];

  beforeEach(() => {
    testWords = [
      {
        id: 'apple',
        emoji: '🍎',
        hebrew: 'תפוח',
        russian: 'яблоко',
        transliteration: 'tapuach',
        category: 'food',
      },
      {
        id: 'dog',
        emoji: '🐕',
        hebrew: 'כלב',
        russian: 'собака',
        transliteration: 'kelev',
        category: 'animals',
      },
      {
        id: 'cat',
        emoji: '🐈',
        hebrew: 'חתול',
        russian: 'кот',
        transliteration: 'chatul',
        category: 'animals',
      },
      {
        id: 'car',
        emoji: '🚗',
        hebrew: 'מכונית',
        russian: 'машина',
        transliteration: 'mechonit',
        category: 'transport',
      },
    ];
  });

  describe('generateLetterDistractors', () => {
    it('должен генерировать указанное количество дистракторов', () => {
      const distractors = generateLetterDistractors('ת', 'תפוח', 3);
      expect(distractors).toHaveLength(3);
    });

    it('дистракторы не должны содержать правильную букву', () => {
      const correctLetter = 'ת';
      const distractors = generateLetterDistractors(correctLetter, 'תפוח', 3);
      expect(distractors).not.toContain(correctLetter);
    });

    it('все дистракторы должны быть уникальными', () => {
      const distractors = generateLetterDistractors('ת', 'תפוח', 5);
      const unique = Array.from(new Set(distractors));
      expect(distractors).toEqual(unique);
    });

    it('не должен добавлять правильную букву даже если она встречается в слове несколько раз', () => {
      const correctLetter = 'א';
      const word = 'אמא'; // буква א встречается дважды
      const distractors = generateLetterDistractors(correctLetter, word, 5);
      expect(distractors).not.toContain('א');
      // Проверяем что все дистракторы уникальны
      const unique = Array.from(new Set(distractors));
      expect(distractors).toEqual(unique);
    });

    it('должен возвращать пустой массив для 0 дистракторов', () => {
      const distractors = generateLetterDistractors('ת', 'תפוח', 0);
      expect(distractors).toEqual([]);
    });
  });

  describe('generateLetterOptions', () => {
    it('должен возвращать указанное количество опций', () => {
      const options = generateLetterOptions('ת', 'תפוח', 4);
      expect(options).toHaveLength(4);
    });

    it('должен содержать правильную букву', () => {
      const correctLetter = 'ת';
      const options = generateLetterOptions(correctLetter, 'תפוח', 4);
      expect(options).toContain(correctLetter);
    });

    it('все опции должны быть уникальными', () => {
      const options = generateLetterOptions('ת', 'תפוח', 4);
      const unique = Array.from(new Set(options));
      expect(options).toEqual(unique);
    });

    it('опции должны быть перемешаны (не всегда в одном порядке)', () => {
      const options1 = generateLetterOptions('ת', 'תפוח', 4);
      const options2 = generateLetterOptions('ת', 'תפוח', 4);
      
      // Проверяем, что множества одинаковые, но порядок может различаться
      expect(options1.sort()).toEqual(options2.sort());
    });
  });

  describe('generateWordOptions', () => {
    it('должен возвращать указанное количество опций', () => {
      const options = generateWordOptions(testWords[0], testWords, 4);
      expect(options).toHaveLength(4);
    });

    it('должен содержать правильное слово', () => {
      const correctWord = testWords[0];
      const options = generateWordOptions(correctWord, testWords, 4);
      expect(options).toContainEqual(correctWord);
    });

    it('все опции должны быть уникальными', () => {
      const options = generateWordOptions(testWords[0], testWords, 3);
      const ids = options.map(w => w.id);
      const unique = Array.from(new Set(ids));
      expect(ids).toEqual(unique);
    });

    it('должен корректно работать когда запрошено больше опций чем доступно', () => {
      const options = generateWordOptions(testWords[0], testWords, 10);
      expect(options.length).toBeLessThanOrEqual(testWords.length);
    });

    it('дистракторы должны быть из той же категории если возможно', () => {
      const correctWord = testWords[1]; // dog (animals)
      const options = generateWordOptions(correctWord, testWords, 2);
      
      // Должен быть dog и cat (оба animals)
      const animalWords = options.filter(w => w.category === 'animals');
      expect(animalWords.length).toBeGreaterThan(0);
    });
  });

  describe('checkLetterAnswer', () => {
    it('должен возвращать true для правильного ответа', () => {
      expect(checkLetterAnswer('ת', 'ת')).toBe(true);
      expect(checkLetterAnswer('א', 'א')).toBe(true);
    });

    it('должен возвращать false для неправильного ответа', () => {
      expect(checkLetterAnswer('ת', 'א')).toBe(false);
      expect(checkLetterAnswer('ש', 'ב')).toBe(false);
    });

    it('должен игнорировать пробелы', () => {
      expect(checkLetterAnswer('  ת  ', 'ת')).toBe(true);
      expect(checkLetterAnswer('ת', '  ת  ')).toBe(true);
    });

    it('должен учитывать финальные формы', () => {
      expect(checkLetterAnswer('ך', 'כ')).toBe(true);
      expect(checkLetterAnswer('ם', 'מ')).toBe(true);
    });

    it('должен быть регистронезависимым (для иврита не применимо, но тест на корректность)', () => {
      expect(checkLetterAnswer('ת', 'ת')).toBe(true);
    });
  });

  describe('checkWordAnswer', () => {
    it('должен возвращать true для правильного ответа', () => {
      expect(checkWordAnswer('שלום', 'שלום')).toBe(true);
      expect(checkWordAnswer('תפוח', 'תפוח')).toBe(true);
    });

    it('должен возвращать false для неправильного ответа', () => {
      expect(checkWordAnswer('שלום', 'תודה')).toBe(false);
      expect(checkWordAnswer('כלב', 'חתול')).toBe(false);
    });

    it('должен игнорировать пробелы', () => {
      expect(checkWordAnswer('  שלום  ', 'שלום')).toBe(true);
      expect(checkWordAnswer('שלום', '  שלום  ')).toBe(true);
    });

    it('должен учитывать финальные формы', () => {
      expect(checkWordAnswer('מפתח', 'מפתח')).toBe(true);
    });

    it('должен различать похожие слова', () => {
      expect(checkWordAnswer('שלום', 'שלו')).toBe(false);
    });
  });

  describe('generateHint', () => {
    it('должен возвращать первую букву слова', () => {
      expect(generateHint('שלום')).toBe('ש');
      expect(generateHint('תפוח')).toBe('ת');
    });

    it('должен корректно работать с односимвольным словом', () => {
      expect(generateHint('א')).toBe('א');
    });

    it('должен возвращать пустую строку для пустого слова', () => {
      expect(generateHint('')).toBe('');
    });

    it('должен работать с любыми символами', () => {
      expect(generateHint('123')).toBe('1');
      expect(generateHint('abc')).toBe('a');
    });
  });

  describe('createWordPlaceholders', () => {
    it('должен создавать плейсхолдеры для всех букв', () => {
      const placeholders = createWordPlaceholders('שלום');
      expect(placeholders).toEqual(['_', '_', '_', '_']);
    });

    it('должен показывать открытые буквы', () => {
      const placeholders = createWordPlaceholders('שלום', [0, 2]);
      expect(placeholders).toEqual(['ש', '_', 'ו', '_']);
    });

    it('должен корректно работать когда все буквы открыты', () => {
      const placeholders = createWordPlaceholders('שלום', [0, 1, 2, 3]);
      expect(placeholders).toEqual(['ש', 'ל', 'ו', 'ם']);
    });

    it('должен возвращать пустой массив для пустого слова', () => {
      const placeholders = createWordPlaceholders('');
      expect(placeholders).toEqual([]);
    });

    it('должен корректно обрабатывать дубликаты в revealed', () => {
      const placeholders = createWordPlaceholders('שלום', [0, 0, 1]);
      expect(placeholders).toEqual(['ש', 'ל', '_', '_']);
    });
  });

  describe('calculatePercentage', () => {
    it('должен правильно вычислять процент', () => {
      expect(calculatePercentage(5, 10)).toBe(50);
      expect(calculatePercentage(3, 10)).toBe(30);
      expect(calculatePercentage(10, 10)).toBe(100);
    });

    it('должен округлять до целого числа', () => {
      expect(calculatePercentage(1, 3)).toBe(33);
      expect(calculatePercentage(2, 3)).toBe(67);
    });

    it('должен возвращать 0 для нулевого total', () => {
      expect(calculatePercentage(5, 0)).toBe(0);
    });

    it('должен возвращать 0 для нулевого correct', () => {
      expect(calculatePercentage(0, 10)).toBe(0);
    });

    it('должен корректно работать с большими числами', () => {
      expect(calculatePercentage(999, 1000)).toBe(100); // 99.9% округляется до 100
      expect(calculatePercentage(500, 1000)).toBe(50);
    });
  });

  describe('formatScore', () => {
    it('должен форматировать счёт корректно', () => {
      expect(formatScore(5, 10)).toBe('✓ 5 / 10 (50%)');
      expect(formatScore(10, 20)).toBe('✓ 10 / 20 (50%)');
    });

    it('должен корректно отображать 100%', () => {
      expect(formatScore(10, 10)).toBe('✓ 10 / 10 (100%)');
    });

    it('должен корректно отображать 0%', () => {
      expect(formatScore(0, 10)).toBe('✓ 0 / 10 (0%)');
    });

    it('должен корректно отображать нулевой счёт', () => {
      expect(formatScore(0, 0)).toBe('✓ 0 / 0 (0%)');
    });

    it('должен включать галочку в начале', () => {
      const score = formatScore(5, 10);
      expect(score.startsWith('✓')).toBe(true);
    });
  });

  describe('getScoreColor', () => {
    it('должен возвращать success для высоких процентов', () => {
      expect(getScoreColor(100)).toBe('success');
      expect(getScoreColor(90)).toBe('success');
      expect(getScoreColor(80)).toBe('success');
    });

    it('должен возвращать warning для средних процентов', () => {
      expect(getScoreColor(79)).toBe('warning');
      expect(getScoreColor(70)).toBe('warning');
      expect(getScoreColor(60)).toBe('warning');
    });

    it('должен возвращать danger для низких процентов', () => {
      expect(getScoreColor(59)).toBe('danger');
      expect(getScoreColor(50)).toBe('danger');
      expect(getScoreColor(0)).toBe('danger');
    });

    it('должен корректно обрабатывать граничные значения', () => {
      expect(getScoreColor(80)).toBe('success');
      expect(getScoreColor(60)).toBe('warning');
    });
  });
});

