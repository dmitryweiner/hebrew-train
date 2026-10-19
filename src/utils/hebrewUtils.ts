// Утилиты для работы с ивритским текстом

/**
 * Проверяет, является ли текст ивритом
 * @param text - текст для проверки
 * @returns true если текст содержит только ивритские символы и пробелы
 */
export const isHebrewText = (text: string): boolean => {
  if (!text) return true; // пустая строка считается валидной
  return /^[\u0590-\u05FF\s'’`]*$/.test(text);
};

/**
 * Заменяет апостроф, набранный с клавиатуры, на ивритский гереш (׳)
 * @param text - текст для нормализации
 * @returns текст с герешем вместо апострофа
 */
export const normalizeGeresh = (text: string): string => {
  return text.replace(/['’`]/g, '׳');
};

/**
 * Проверяет, является ли символ ивритской буквой (не пробел, не гереш, не огласовка)
 * @param char - символ
 * @returns true для букв א–ת, включая конечные формы
 */
export const isHebrewLetter = (char: string): boolean => {
  return /^[\u05D0-\u05EA]$/.test(char);
};

/**
 * Считает количество ивритских букв в слове (без пробелов и гереша)
 * @param word - слово
 * @returns число букв
 */
export const countHebrewLetters = (word: string): number => {
  return Array.from(word).filter(isHebrewLetter).length;
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
  const normalize = (word: string) => normalizeFinalLetters(normalizeGeresh(word.trim()));
  return normalize(word1) === normalize(word2);
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

/**
 * Получает случайную позицию буквы в слове (пробелы и гереш не выбираются)
 * @param word - слово
 * @returns случайная позиция (индекс)
 */
export const getRandomPosition = (word: string): number => {
  const letterPositions = Array.from(word)
    .map((char, index) => (isHebrewLetter(char) ? index : -1))
    .filter(index => index >= 0);
  if (letterPositions.length === 0) return 0;
  return letterPositions[Math.floor(Math.random() * letterPositions.length)];
};

/**
 * Скрывает букву в указанной позиции
 * @param word - слово
 * @param position - позиция буквы
 * @returns объект с отображаемым словом и скрытой буквой
 */
export const hideLetterAtPosition = (word: string, position: number): { displayWord: string; hiddenLetter: string } => {
  const letters = splitHebrewWord(word);
  const hiddenLetter = letters[position];
  const displayWord = letters.map((letter, index) => 
    index === position ? '_' : letter
  ).join(' ');
  
  return { displayWord, hiddenLetter };
};

