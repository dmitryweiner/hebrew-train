// Утилиты для игры с анаграммами (Игра 5)

import { shuffleArray } from './wordUtils';
import { getRandomHebrewLetter } from './hebrewUtils';

/**
 * Перемешивает буквы слова для анаграммы
 * @param word - исходное слово
 * @returns массив перемешанных букв
 */
export const shuffleWordLetters = (word: string): string[] => {
  const letters = Array.from(word);
  return shuffleArray(letters);
};

/**
 * Добавляет дистракторные буквы к анаграмме
 * @param letters - массив букв слова
 * @param count - количество дистракторов для добавления
 * @returns массив букв с дистракторами
 */
export const addDistractorLetters = (letters: string[], count: number = 3): string[] => {
  const distractors: string[] = [];
  const existingLetters = [...letters];

  for (let i = 0; i < count; i++) {
    const distractor = getRandomHebrewLetter(existingLetters);
    if (distractor) {
      distractors.push(distractor);
      existingLetters.push(distractor); // Избегаем дублирования дистракторов
    }
  }

  return shuffleArray([...letters, ...distractors]);
};

/**
 * Создаёт набор букв для анаграммы с дистракторами
 * @param word - исходное слово
 * @param distractorCount - количество дистракторных букв
 * @returns перемешанный массив букв
 */
export const createAnagramLetters = (word: string, distractorCount: number = 2): string[] => {
  const wordLetters = Array.from(word);
  return addDistractorLetters(wordLetters, distractorCount);
};

/**
 * Проверяет, правильно ли собрано слово из выбранных букв
 * @param selectedLetters - массив выбранных букв в порядке выбора
 * @param correctWord - правильное слово
 * @returns true если слово собрано правильно
 */
export const checkAnagramAnswer = (selectedLetters: string[], correctWord: string): boolean => {
  const userWord = selectedLetters.join('');
  return userWord === correctWord;
};

/**
 * Генерирует индексы для отслеживания состояния букв
 * @param letters - массив букв
 * @returns массив объектов с буквой и её индексом
 */
export const createLetterButtons = (letters: string[]): Array<{ letter: string; id: string; used: boolean }> => {
  return letters.map((letter, index) => ({
    letter,
    id: `letter-${index}`,
    used: false,
  }));
};

