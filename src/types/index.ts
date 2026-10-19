// Основные типы для приложения Hebrew Train

export interface Word {
  id: string;                    // уникальный идентификатор
  emoji?: string;                // эмодзи символ (опционально, если есть picture)
  picture?: string;              // путь к SVG картинке (опционально, если есть emoji)
  hebrew: string;                // слово на иврите
  russian: string;               // перевод на русский
  transliteration: string;       // латинская транслитерация
  category: string;              // категория (food, animals, transport, etc.)
  nikud?: string;                // слово с огласовками: תַּפּוּחַ
  mnemonic?: string;             // ассоциация на русском для запоминания
  tags?: string[];               // тематические наборы: kitchen, stationery, ...
}

// Виды заданий (одно задание — один экран игры)
export type GameType =
  | 'letter-choice'    // Угадай букву: выбор пропущенной буквы (шаг знакомства)
  | 'word-choice'      // Угадай слово: картинка → 4 слова
  | 'word-input'       // Напиши слово: ввод слова целиком
  | 'anagram'          // Собери слово из плиток
  | 'matching'         // Найди пары: картинки ↔ слова
  | 'memory'           // Мемори: карточки рубашкой вверх
  | 'flashcards'       // Карточки с самооценкой
  | 'speed'            // Верно / Неверно на время
  | 'listen';          // Послушай и выбери картинку

// Вид раунда: отдельная игра или «Тренировка дня»
export type RoundKind = GameType | 'daily';
