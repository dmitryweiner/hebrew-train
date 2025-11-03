// Общие утилиты для игр

import type { Word } from '../types';
import { getSimilarHebrewLetters, getRandomHebrewLetter, normalizeFinalLetters } from './hebrewUtils';
import { shuffleArray } from './wordUtils';

/**
 * Генерирует дистракторы (неправильные варианты) букв для игры
 * @param correctLetter - правильная буква
 * @param word - слово, из которого взята буква
 * @param count - количество дистракторов
 * @returns массив букв-дистракторов
 */
export const generateLetterDistractors = (
  correctLetter: string,
  word: string,
  count: number
): string[] => {
  const distractors = new Set<string>();
  const normalizedCorrect = normalizeFinalLetters(correctLetter);
  const wordLetters = Array.from(word).map(l => normalizeFinalLetters(l));

  // 1. Добавляем визуально похожие буквы
  const similar = getSimilarHebrewLetters(correctLetter);
  similar.forEach(letter => {
    if (distractors.size < count && letter !== normalizedCorrect) {
      distractors.add(letter);
    }
  });

  // 2. Добавляем другие буквы из того же слова
  wordLetters.forEach(letter => {
    if (distractors.size < count && letter !== normalizedCorrect && !distractors.has(letter)) {
      distractors.add(letter);
    }
  });

  // 3. Добавляем случайные буквы, если нужно больше
  while (distractors.size < count) {
    const randomLetter = getRandomHebrewLetter([normalizedCorrect, ...Array.from(distractors)]);
    if (randomLetter && randomLetter !== normalizedCorrect) {
      distractors.add(randomLetter);
    }
  }

  return Array.from(distractors).slice(0, count);
};

/**
 * Генерирует варианты ответов для игры с выбором буквы
 * @param correctLetter - правильная буква
 * @param word - слово
 * @param optionsCount - общее количество вариантов (включая правильный)
 * @returns перемешанный массив вариантов
 */
export const generateLetterOptions = (
  correctLetter: string,
  word: string,
  optionsCount: number = 4
): string[] => {
  const distractors = generateLetterDistractors(correctLetter, word, optionsCount - 1);
  const options = [correctLetter, ...distractors];
  return shuffleArray(options);
};

/**
 * Генерирует варианты ответов для игры с выбором слова
 * @param correctWord - правильное слово
 * @param allWords - все доступные слова
 * @param optionsCount - общее количество вариантов
 * @returns перемешанный массив слов
 */
export const generateWordOptions = (
  correctWord: Word,
  allWords: Word[],
  optionsCount: number = 4
): Word[] => {
  // Фильтруем слова: исключаем правильное и берём из той же категории
  let distractors = allWords.filter(
    word => word.id !== correctWord.id && word.category === correctWord.category
  );

  // Если недостаточно слов из той же категории, берём любые
  if (distractors.length < optionsCount - 1) {
    const additional = allWords.filter(
      word => word.id !== correctWord.id && !distractors.some(d => d.id === word.id)
    );
    distractors = [...distractors, ...additional];
  }

  // Перемешиваем и берём нужное количество
  const shuffledDistractors = shuffleArray(distractors).slice(0, optionsCount - 1);
  const options = [correctWord, ...shuffledDistractors];

  return shuffleArray(options);
};

/**
 * Проверяет правильность ответа пользователя (буква)
 * @param userAnswer - ответ пользователя
 * @param correctLetter - правильная буква
 * @returns true если ответ правильный
 */
export const checkLetterAnswer = (userAnswer: string, correctLetter: string): boolean => {
  const normalizedUser = normalizeFinalLetters(userAnswer.trim());
  const normalizedCorrect = normalizeFinalLetters(correctLetter.trim());
  return normalizedUser === normalizedCorrect;
};

/**
 * Проверяет правильность ответа пользователя (слово)
 * @param userAnswer - ответ пользователя
 * @param correctWord - правильное слово
 * @returns true если ответ правильный
 */
export const checkWordAnswer = (userAnswer: string, correctWord: string): boolean => {
  const normalizedUser = normalizeFinalLetters(userAnswer.trim());
  const normalizedCorrect = normalizeFinalLetters(correctWord.trim());
  return normalizedUser === normalizedCorrect;
};

/**
 * Генерирует подсказку для слова (первая буква)
 * @param word - слово
 * @returns первая буква слова
 */
export const generateHint = (word: string): string => {
  return Array.from(word)[0] || '';
};

/**
 * Создаёт массив плейсхолдеров для отображения длины слова
 * @param word - слово
 * @param revealed - индексы открытых букв
 * @returns массив символов (буквы или "_")
 */
export const createWordPlaceholders = (word: string, revealed: number[] = []): string[] => {
  return Array.from(word).map((letter, index) =>
    revealed.includes(index) ? letter : '_'
  );
};

/**
 * Вычисляет процент правильных ответов
 * @param correct - количество правильных ответов
 * @param total - общее количество ответов
 * @returns процент (округлённый до целого)
 */
export const calculatePercentage = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * Форматирует счёт для отображения
 * @param correct - количество правильных ответов
 * @param total - общее количество ответов
 * @returns строка формата "✓ 15 / 20 (75%)"
 */
export const formatScore = (correct: number, total: number): string => {
  const percentage = calculatePercentage(correct, total);
  return `✓ ${correct} / ${total} (${percentage}%)`;
};

/**
 * Определяет цвет для отображения процента
 * @param percentage - процент правильных ответов
 * @returns название класса Bootstrap или цвета
 */
export const getScoreColor = (percentage: number): string => {
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'warning';
  return 'danger';
};

