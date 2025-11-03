// Утилиты для работы со словами и словарём

import type { Word } from '../types';

/**
 * Получает случайное слово из словаря
 * @param words - массив слов
 * @param exclude - слова для исключения
 * @returns случайное слово
 */
export const getRandomWord = (words: Word[], exclude: string[] = []): Word | null => {
  const availableWords = words.filter(word => !exclude.includes(word.id));
  if (availableWords.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  return availableWords[randomIndex];
};

/**
 * Получает слова по категории
 * @param words - массив слов
 * @param category - категория
 * @returns массив слов из категории
 */
export const getWordsByCategory = (words: Word[], category: string): Word[] => {
  return words.filter(word => word.category === category);
};

/**
 * Получает слова по уровню сложности
 * @param words - массив слов
 * @param difficulty - уровень сложности
 * @returns массив слов с указанной сложностью
 */
export const getWordsByDifficulty = (words: Word[], difficulty: 1 | 2 | 3): Word[] => {
  return words.filter(word => word.difficulty === difficulty);
};

/**
 * Получает дистракторы (похожие слова) для игры
 * @param words - массив всех слов
 * @param correctWord - правильное слово
 * @param count - количество дистракторов
 * @returns массив дистракторов
 */
export const getDistractorWords = (words: Word[], correctWord: Word, count: number): Word[] => {
  // Приоритет: слова из той же категории
  let distractors = words.filter(
    word => word.id !== correctWord.id && word.category === correctWord.category
  );

  // Если недостаточно, добавляем слова похожей длины
  if (distractors.length < count) {
    const wordLength = correctWord.hebrew.length;
    const similarLength = words.filter(
      word =>
        word.id !== correctWord.id &&
        !distractors.some(d => d.id === word.id) &&
        Math.abs(word.hebrew.length - wordLength) <= 2
    );
    distractors = [...distractors, ...similarLength];
  }

  // Если всё ещё недостаточно, добавляем любые слова
  if (distractors.length < count) {
    const remaining = words.filter(
      word => word.id !== correctWord.id && !distractors.some(d => d.id === word.id)
    );
    distractors = [...distractors, ...remaining];
  }

  // Перемешиваем и возвращаем нужное количество
  return shuffleArray(distractors).slice(0, count);
};

/**
 * Перемешивает массив (алгоритм Fisher-Yates)
 * @param array - массив для перемешивания
 * @returns перемешанный массив
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Получает случайную позицию для пропущенной буквы в слове
 * @param wordLength - длина слова
 * @returns позиция (индекс) пропущенной буквы
 */
export const getRandomMissingPosition = (wordLength: number): number => {
  return Math.floor(Math.random() * wordLength);
};

/**
 * Создаёт слово с пропущенной буквой
 * @param word - исходное слово
 * @param position - позиция пропущенной буквы
 * @param placeholder - символ-заполнитель (по умолчанию "_")
 * @returns слово с пропущенной буквой
 */
export const createWordWithGap = (word: string, position: number, placeholder: string = '_'): string => {
  const letters = Array.from(word);
  letters[position] = placeholder;
  return letters.join(' ');
};

/**
 * Получает букву на указанной позиции
 * @param word - слово
 * @param position - позиция
 * @returns буква
 */
export const getLetterAtPosition = (word: string, position: number): string => {
  return Array.from(word)[position] || '';
};

/**
 * Получает все категории из словаря
 * @param words - массив слов
 * @returns массив уникальных категорий
 */
export const getAllCategories = (words: Word[]): string[] => {
  const categories = words.map(word => word.category);
  return Array.from(new Set(categories));
};

/**
 * Фильтрует слова по нескольким категориям
 * @param words - массив слов
 * @param categories - массив категорий
 * @returns отфильтрованные слова
 */
export const filterWordsByCategories = (words: Word[], categories: string[]): Word[] => {
  return words.filter(word => categories.includes(word.category));
};

