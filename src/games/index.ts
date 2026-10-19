// Компоненты заданий по видам игр

import type { ComponentType } from 'react';
import type { GameType } from '../types';
import type { TaskProps } from './types';
import WordChoiceTask from './WordChoiceTask';
import LetterChoiceTask from './LetterChoiceTask';
import WordInputTask from './WordInputTask';
import FlashcardTask from './FlashcardTask';
import MatchingTask from './MatchingTask';
import AnagramTask from './AnagramTask';
import MemoryTask from './MemoryTask';
import SpeedTask from './SpeedTask';
import ListenTask from './ListenTask';

export const TASK_COMPONENTS: Partial<Record<GameType, ComponentType<TaskProps>>> = {
  'word-choice': WordChoiceTask,
  'letter-choice': LetterChoiceTask,
  'word-input': WordInputTask,
  flashcards: FlashcardTask,
  matching: MatchingTask,
  anagram: AnagramTask,
  memory: MemoryTask,
  speed: SpeedTask,
  listen: ListenTask,
};
