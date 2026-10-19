// Словарь приложения

import type { Word } from '../types';
import wordsData from './words.json';

export const WORDS: Word[] = wordsData as Word[];

export const WORD_BY_ID: Record<string, Word> = Object.fromEntries(WORDS.map(w => [w.id, w]));

export const WORD_IDS: string[] = WORDS.map(w => w.id);
