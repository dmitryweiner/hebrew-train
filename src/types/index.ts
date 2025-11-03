// Основные типы для приложения Hebrew Train

export interface Word {
  id: string;                    // уникальный идентификатор
  emoji: string;                 // эмодзи символ
  hebrew: string;                // слово на иврите
  russian: string;               // перевод на русский
  transliteration: string;       // латинская транслитерация
  category: string;              // категория (food, animals, transport, etc.)
  difficulty: 1 | 2 | 3;         // 1 - простое, 3 - сложное
  audioUrl?: string;             // опционально: ссылка на аудио произношения
  frequencyRank?: number;        // опционально: частотность слова в иврите
}

export type GameType = 
  | 'letter-choice'    // Игра 1: Выбор пропущенной буквы
  | 'letter-input'     // Игра 2: Ввод пропущенной буквы
  | 'word-choice'      // Игра 3: Выбор правильного слова
  | 'word-input'       // Игра 4: Написание слова целиком
  | 'anagram'          // Игра 5: Составление слова из букв
  | 'matching'         // Игра 6: Сопоставление пар
  | 'speed';           // Игра 7: Проверка знаний (да/нет)

export interface GameScore {
  correct: number;     // количество правильных ответов
  total: number;       // общее количество попыток
  percentage: number;  // процент правильных ответов
}

export type GameStats = {
  [K in GameType]?: GameScore;
} & {
  lastSession?: string;
};

export interface GameState {
  currentGame: GameType | null;
  currentWord: Word | null;
  missingPosition: number;     // позиция пропущенной буквы
  options: string[];           // варианты ответов
  userAnswer: string;
  isCorrect: boolean | null;
  attempts: number;
}

export interface MatchingPair {
  id: string;
  emoji: string;
  word: string;
  matched: boolean;
  selected: boolean;
}

