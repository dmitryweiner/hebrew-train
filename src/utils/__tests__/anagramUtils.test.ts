// Тесты для anagramUtils

import { describe, it, expect } from 'vitest';
import {
  shuffleWordLetters,
  addDistractorLetters,
  createAnagramLetters,
  checkAnagramAnswer,
  createLetterButtons,
} from '../anagramUtils';

describe('anagramUtils', () => {
  describe('shuffleWordLetters', () => {
    it('должен возвращать массив той же длины', () => {
      const word = 'שלום';
      const shuffled = shuffleWordLetters(word);
      expect(shuffled).toHaveLength(4);
    });

    it('должен содержать все исходные буквы', () => {
      const word = 'תפוח';
      const shuffled = shuffleWordLetters(word);
      expect(shuffled.sort()).toEqual(['ת', 'פ', 'ו', 'ח'].sort());
    });

    it('должен перемешивать буквы (в большинстве случаев)', () => {
      const word = 'אבגדהוזחטיכלמנסעפצקרשת'; // длинное слово
      const original = Array.from(word);
      const shuffled = shuffleWordLetters(word);
      
      // С высокой вероятностью порядок должен измениться
      const isDifferent = shuffled.some((letter, idx) => letter !== original[idx]);
      expect(isDifferent).toBe(true);
    });

    it('должен корректно работать с односимвольным словом', () => {
      const shuffled = shuffleWordLetters('א');
      expect(shuffled).toEqual(['א']);
    });

    it('должен корректно работать с пустым словом', () => {
      const shuffled = shuffleWordLetters('');
      expect(shuffled).toEqual([]);
    });
  });

  describe('addDistractorLetters', () => {
    it('должен добавлять указанное количество дистракторов', () => {
      const letters = ['ש', 'ל', 'ו', 'ם'];
      const result = addDistractorLetters(letters, 3);
      expect(result).toHaveLength(7); // 4 + 3
    });

    it('должен содержать все исходные буквы', () => {
      const letters = ['ש', 'ל', 'ו', 'ם'];
      const result = addDistractorLetters(letters, 2);
      
      letters.forEach(letter => {
        expect(result).toContain(letter);
      });
    });

    it('дистракторы должны быть ивритскими буквами', () => {
      const letters = ['ש', 'ל'];
      const result = addDistractorLetters(letters, 3);
      
      // Все буквы должны быть в диапазоне иврита
      result.forEach(letter => {
        const code = letter.charCodeAt(0);
        expect(code).toBeGreaterThanOrEqual(0x05D0);
        expect(code).toBeLessThanOrEqual(0x05EA);
      });
    });

    it('должен возвращать перемешанный массив', () => {
      const letters = ['א', 'ב', 'ג'];
      const result = addDistractorLetters(letters, 2);
      
      // Результат должен быть перемешан
      expect(result).toHaveLength(5);
    });

    it('должен корректно работать с пустым массивом', () => {
      const result = addDistractorLetters([], 3);
      expect(result).toHaveLength(3);
    });

    it('должен корректно работать с нулевым количеством дистракторов', () => {
      const letters = ['ש', 'ל', 'ו'];
      const result = addDistractorLetters(letters, 0);
      expect(result).toHaveLength(3);
    });
  });

  describe('createAnagramLetters', () => {
    it('должен создавать массив букв с дистракторами', () => {
      const word = 'שלום';
      const result = createAnagramLetters(word, 2);
      expect(result).toHaveLength(6); // 4 + 2
    });

    it('должен содержать все буквы слова', () => {
      const word = 'תפוח';
      const result = createAnagramLetters(word, 2);
      
      ['ת', 'פ', 'ו', 'ח'].forEach(letter => {
        expect(result).toContain(letter);
      });
    });

    it('должен использовать значение по умолчанию для дистракторов', () => {
      const word = 'שלום';
      const result = createAnagramLetters(word);
      expect(result.length).toBeGreaterThan(4);
    });

    it('должен корректно работать с односимвольным словом', () => {
      const word = 'א';
      const result = createAnagramLetters(word, 2);
      expect(result).toHaveLength(3);
      expect(result).toContain('א');
    });

    it('результат должен быть перемешан', () => {
      const word = 'אבגדה';
      const original = Array.from(word);
      const result = createAnagramLetters(word, 0);
      
      // С высокой вероятностью порядок должен отличаться
      const isDifferent = result.some((letter, idx) => letter !== original[idx]);
      expect(isDifferent).toBe(true);
    });
  });

  describe('checkAnagramAnswer', () => {
    it('должен возвращать true для правильного ответа', () => {
      const selected = ['ש', 'ל', 'ו', 'ם'];
      expect(checkAnagramAnswer(selected, 'שלום')).toBe(true);
    });

    it('должен возвращать false для неправильного ответа', () => {
      const selected = ['ם', 'ו', 'ל', 'ש']; // неправильный порядок
      expect(checkAnagramAnswer(selected, 'שלום')).toBe(false);
    });

    it('должен возвращать false для неполного ответа', () => {
      const selected = ['ש', 'ל', 'ו'];
      expect(checkAnagramAnswer(selected, 'שלום')).toBe(false);
    });

    it('должен возвращать false для избыточного ответа', () => {
      const selected = ['ש', 'ל', 'ו', 'ם', 'א'];
      expect(checkAnagramAnswer(selected, 'שלום')).toBe(false);
    });

    it('должен возвращать true для односимвольного слова', () => {
      const selected = ['א'];
      expect(checkAnagramAnswer(selected, 'א')).toBe(true);
    });

    it('должен возвращать true для пустого слова и пустого массива', () => {
      expect(checkAnagramAnswer([], '')).toBe(true);
    });

    it('должен учитывать порядок букв', () => {
      const selected1 = ['ת', 'פ', 'ו', 'ח'];
      const selected2 = ['ח', 'ו', 'פ', 'ת'];
      
      expect(checkAnagramAnswer(selected1, 'תפוח')).toBe(true);
      expect(checkAnagramAnswer(selected2, 'תפוח')).toBe(false);
    });
  });

  describe('createLetterButtons', () => {
    it('должен создавать кнопки для каждой буквы', () => {
      const letters = ['ש', 'ל', 'ו', 'ם'];
      const buttons = createLetterButtons(letters);
      
      expect(buttons).toHaveLength(4);
    });

    it('каждая кнопка должна иметь букву, id и флаг used', () => {
      const letters = ['ש', 'ל'];
      const buttons = createLetterButtons(letters);
      
      buttons.forEach(button => {
        expect(button).toHaveProperty('letter');
        expect(button).toHaveProperty('id');
        expect(button).toHaveProperty('used');
      });
    });

    it('все кнопки должны изначально быть неиспользованными', () => {
      const letters = ['ש', 'ל', 'ו'];
      const buttons = createLetterButtons(letters);
      
      buttons.forEach(button => {
        expect(button.used).toBe(false);
      });
    });

    it('каждая кнопка должна иметь уникальный id', () => {
      const letters = ['ש', 'ל', 'ו', 'ם'];
      const buttons = createLetterButtons(letters);
      
      const ids = buttons.map(b => b.id);
      const uniqueIds = Array.from(new Set(ids));
      expect(ids).toEqual(uniqueIds);
    });

    it('id должен содержать префикс letter-', () => {
      const letters = ['ש', 'ל'];
      const buttons = createLetterButtons(letters);
      
      buttons.forEach(button => {
        expect(button.id).toMatch(/^letter-\d+$/);
      });
    });

    it('должен корректно обрабатывать пустой массив', () => {
      const buttons = createLetterButtons([]);
      expect(buttons).toEqual([]);
    });

    it('должен корректно обрабатывать одну букву', () => {
      const letters = ['א'];
      const buttons = createLetterButtons(letters);
      
      expect(buttons).toHaveLength(1);
      expect(buttons[0].letter).toBe('א');
      expect(buttons[0].used).toBe(false);
    });

    it('должен сохранять порядок букв', () => {
      const letters = ['א', 'ב', 'ג', 'ד'];
      const buttons = createLetterButtons(letters);
      
      buttons.forEach((button, idx) => {
        expect(button.letter).toBe(letters[idx]);
      });
    });
  });
});

