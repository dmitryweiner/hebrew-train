// Тесты для wordUtils

import { describe, it, expect, beforeEach } from 'vitest';
import type { Word } from '../../types';
import {
  getRandomWord,
  getWordsByCategory,
  getDistractorWords,
  shuffleArray,
  getRandomMissingPosition,
  createWordWithGap,
  getLetterAtPosition,
  getAllCategories,
  filterWordsByCategories,
} from '../wordUtils';

describe('wordUtils', () => {
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
      {
        id: 'bus',
        emoji: '🚌',
        hebrew: 'אוטובוס',
        russian: 'автобус',
        transliteration: 'autobus',
        category: 'transport',
      },
    ];
  });

  describe('getRandomWord', () => {
    it('должен возвращать случайное слово', () => {
      const word = getRandomWord(testWords);
      expect(word).toBeDefined();
      expect(testWords).toContainEqual(word);
    });

    it('не должен возвращать исключённые слова', () => {
      const exclude = ['apple', 'dog'];
      const word = getRandomWord(testWords, exclude);
      expect(word).toBeDefined();
      expect(exclude).not.toContain(word!.id);
    });

    it('должен возвращать null если все слова исключены', () => {
      const exclude = testWords.map(w => w.id);
      const word = getRandomWord(testWords, exclude);
      expect(word).toBeNull();
    });

    it('должен возвращать null для пустого массива', () => {
      const word = getRandomWord([]);
      expect(word).toBeNull();
    });
  });

  describe('getWordsByCategory', () => {
    it('должен возвращать слова из категории food', () => {
      const words = getWordsByCategory(testWords, 'food');
      expect(words).toHaveLength(1);
      expect(words[0].id).toBe('apple');
    });

    it('должен возвращать слова из категории animals', () => {
      const words = getWordsByCategory(testWords, 'animals');
      expect(words).toHaveLength(2);
      expect(words.map(w => w.id)).toContain('dog');
      expect(words.map(w => w.id)).toContain('cat');
    });

    it('должен возвращать пустой массив для несуществующей категории', () => {
      const words = getWordsByCategory(testWords, 'nonexistent');
      expect(words).toHaveLength(0);
    });
  });

  describe('getDistractorWords', () => {
    it('должен возвращать дистракторы из той же категории', () => {
      const correctWord = testWords[1]; // dog (animals)
      const distractors = getDistractorWords(testWords, correctWord, 1);
      
      expect(distractors).toHaveLength(1);
      expect(distractors[0].id).not.toBe(correctWord.id);
    });

    it('должен возвращать запрошенное количество дистракторов', () => {
      const correctWord = testWords[0]; // apple
      const distractors = getDistractorWords(testWords, correctWord, 3);
      
      expect(distractors.length).toBeLessThanOrEqual(3);
    });

    it('не должен включать правильное слово', () => {
      const correctWord = testWords[0];
      const distractors = getDistractorWords(testWords, correctWord, 3);
      
      expect(distractors).not.toContainEqual(correctWord);
    });

    it('должен добавлять слова других категорий при необходимости', () => {
      const correctWord = testWords[0]; // apple (единственное в food)
      const distractors = getDistractorWords(testWords, correctWord, 3);
      
      expect(distractors.length).toBeGreaterThan(0);
    });
  });

  describe('shuffleArray', () => {
    it('должен возвращать массив той же длины', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled).toHaveLength(arr.length);
    });

    it('должен содержать все исходные элементы', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('не должен изменять исходный массив', () => {
      const arr = [1, 2, 3, 4, 5];
      const copy = [...arr];
      shuffleArray(arr);
      expect(arr).toEqual(copy);
    });

    it('должен корректно работать с пустым массивом', () => {
      const shuffled = shuffleArray([]);
      expect(shuffled).toEqual([]);
    });

    it('должен перемешивать элементы', () => {
      const arr = Array.from({ length: 20 }, (_, i) => i);
      const shuffled = shuffleArray(arr);
      
      // С высокой вероятностью порядок должен измениться
      const isDifferent = shuffled.some((val, idx) => val !== arr[idx]);
      expect(isDifferent).toBe(true);
    });
  });

  describe('getRandomMissingPosition', () => {
    it('должен возвращать позицию в пределах длины слова', () => {
      const position = getRandomMissingPosition(5);
      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(5);
    });

    it('должен работать для слова длиной 1', () => {
      const position = getRandomMissingPosition(1);
      expect(position).toBe(0);
    });

    it('должен возвращать разные позиции', () => {
      const positions = new Set();
      for (let i = 0; i < 20; i++) {
        positions.add(getRandomMissingPosition(10));
      }
      expect(positions.size).toBeGreaterThan(1);
    });
  });

  describe('createWordWithGap', () => {
    it('должен создавать слово с пропуском', () => {
      const result = createWordWithGap('שלום', 1);
      expect(result).toBe('ש _ ו ם');
    });

    it('должен использовать кастомный placeholder', () => {
      const result = createWordWithGap('שלום', 1, '*');
      expect(result).toBe('ש * ו ם');
    });

    it('должен корректно обрабатывать первую позицию', () => {
      const result = createWordWithGap('שלום', 0);
      expect(result).toBe('_ ל ו ם');
    });

    it('должен корректно обрабатывать последнюю позицию', () => {
      const result = createWordWithGap('שלום', 3);
      expect(result).toBe('ש ל ו _');
    });
  });

  describe('getLetterAtPosition', () => {
    it('должен возвращать букву на указанной позиции', () => {
      expect(getLetterAtPosition('שלום', 0)).toBe('ש');
      expect(getLetterAtPosition('שלום', 1)).toBe('ל');
      expect(getLetterAtPosition('שלום', 3)).toBe('ם');
    });

    it('должен возвращать пустую строку для несуществующей позиции', () => {
      expect(getLetterAtPosition('שלום', 10)).toBe('');
      expect(getLetterAtPosition('שלום', -1)).toBe('');
    });

    it('должен корректно работать с пустой строкой', () => {
      expect(getLetterAtPosition('', 0)).toBe('');
    });
  });

  describe('getAllCategories', () => {
    it('должен возвращать все уникальные категории', () => {
      const categories = getAllCategories(testWords);
      expect(categories).toHaveLength(3);
      expect(categories).toContain('food');
      expect(categories).toContain('animals');
      expect(categories).toContain('transport');
    });

    it('должен возвращать пустой массив для пустого ввода', () => {
      const categories = getAllCategories([]);
      expect(categories).toEqual([]);
    });

    it('не должен содержать дубликаты', () => {
      const categories = getAllCategories(testWords);
      const unique = Array.from(new Set(categories));
      expect(categories).toEqual(unique);
    });
  });

  describe('filterWordsByCategories', () => {
    it('должен фильтровать слова по одной категории', () => {
      const filtered = filterWordsByCategories(testWords, ['animals']);
      expect(filtered).toHaveLength(2);
      filtered.forEach(word => {
        expect(word.category).toBe('animals');
      });
    });

    it('должен фильтровать слова по нескольким категориям', () => {
      const filtered = filterWordsByCategories(testWords, ['food', 'transport']);
      expect(filtered).toHaveLength(3);
    });

    it('должен возвращать пустой массив для несуществующих категорий', () => {
      const filtered = filterWordsByCategories(testWords, ['nonexistent']);
      expect(filtered).toEqual([]);
    });

    it('должен возвращать пустой массив для пустого списка категорий', () => {
      const filtered = filterWordsByCategories(testWords, []);
      expect(filtered).toEqual([]);
    });
  });
});

