// Утилиты для работы с ивритским текстом

/**
 * Проверяет, является ли текст ивритом
 * @param text - текст для проверки
 * @returns true если текст содержит только ивритские символы и пробелы
 */
export const isHebrewText = (text: string): boolean => {
  if (!text) return true; // пустая строка считается валидной
  return /^[\u0590-\u05FF\s]*$/.test(text);
};

/**
 * Нормализует финальные формы ивритских букв
 * Преобразует финальные формы букв в обычные: ך → כ, ם → מ, ן → נ, ף → פ, ץ → צ
 * @param text - текст для нормализации
 * @returns нормализованный текст
 */
export const normalizeFinalLetters = (text: string): string => {
  return text
    .replace(/ך/g, 'כ')
    .replace(/ם/g, 'מ')
    .replace(/ן/g, 'נ')
    .replace(/ף/g, 'פ')
    .replace(/ץ/g, 'צ');
};

/**
 * Сравнивает два ивритских слова с учётом нормализации финальных форм
 * @param word1 - первое слово
 * @param word2 - второе слово
 * @returns true если слова одинаковые
 */
export const compareHebrewWords = (word1: string, word2: string): boolean => {
  return normalizeFinalLetters(word1.trim()) === normalizeFinalLetters(word2.trim());
};

/**
 * Получает визуально похожие ивритские буквы
 * @param letter - буква
 * @returns массив похожих букв
 */
export const getSimilarHebrewLetters = (letter: string): string[] => {
  const similarGroups: { [key: string]: string[] } = {
    'ד': ['ר', 'ה', 'ת'],
    'ר': ['ד', 'ה', 'ת'],
    'ב': ['כ', 'נ', 'מ'],
    'כ': ['ב', 'נ', 'מ'],
    'ה': ['ח', 'ת', 'ד'],
    'ח': ['ה', 'ת'],
    'ת': ['ה', 'ח', 'ד'],
    'ו': ['ז', 'י'],
    'ז': ['ו', 'י'],
    'י': ['ו', 'ז'],
    'ע': ['צ'],
    'צ': ['ע'],
    'ק': ['כ'],
    'ש': ['ת'],
    'מ': ['ם', 'ב', 'כ'],
    'נ': ['ן', 'ב'],
    'פ': ['ף', 'כ'],
  };

  const normalizedLetter = normalizeFinalLetters(letter);
  return similarGroups[normalizedLetter] || [];
};

/**
 * Получает все ивритские буквы
 * @returns массив всех букв алфавита
 */
export const getHebrewAlphabet = (): string[] => {
  return [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
    'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר',
    'ש', 'ת'
  ];
};

/**
 * Получает случайную ивритскую букву
 * @param exclude - буквы, которые нужно исключить
 * @returns случайная буква
 */
export const getRandomHebrewLetter = (exclude: string[] = []): string => {
  const alphabet = getHebrewAlphabet().filter(
    letter => !exclude.includes(letter) && !exclude.includes(normalizeFinalLetters(letter))
  );
  return alphabet[Math.floor(Math.random() * alphabet.length)];
};

/**
 * Разбивает ивритское слово на массив букв
 * @param word - слово
 * @returns массив букв
 */
export const splitHebrewWord = (word: string): string[] => {
  return Array.from(word.trim());
};

/**
 * Проверяет, содержит ли слово букву
 * @param word - слово
 * @param letter - буква
 * @returns true если буква содержится в слове
 */
export const wordContainsLetter = (word: string, letter: string): boolean => {
  const normalizedWord = normalizeFinalLetters(word);
  const normalizedLetter = normalizeFinalLetters(letter);
  return normalizedWord.includes(normalizedLetter);
};

