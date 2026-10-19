// Описание игр для меню и заголовков

import type { RoundKind } from '../types';

export interface GameInfo {
  title: string;
  icon: string;
  description: string;
}

export const GAME_INFO: Record<RoundKind, GameInfo> = {
  daily: { title: 'Тренировка дня', icon: '🎯', description: 'Новые слова и повторение — всё в одном раунде' },
  'letter-choice': { title: 'Угадай букву', icon: '🔤', description: 'Выберите пропущенную букву' },
  'word-choice': { title: 'Угадай слово', icon: '🖼️', description: 'Картинка и четыре слова на выбор' },
  'word-input': { title: 'Напиши слово', icon: '✍️', description: 'Для хорошо знакомых слов: напишите целиком' },
  anagram: { title: 'Собери слово', icon: '🧩', description: 'Составьте слово из букв-плиток' },
  matching: { title: 'Найди пары', icon: '🔗', description: 'Соедините картинки со словами' },
  memory: { title: 'Мемори', icon: '🃏', description: 'Откройте пары: картинка и слово' },
  flashcards: { title: 'Карточки', icon: '📇', description: 'Посмотрите слово и оцените себя' },
  speed: { title: 'Верно или нет', icon: '⚡', description: '60 секунд: подходит ли слово к картинке' },
  listen: { title: 'Послушай и выбери', icon: '👂', description: 'Услышьте слово и найдите картинку' },
};
