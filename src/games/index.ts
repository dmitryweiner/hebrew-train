// Компоненты заданий по видам игр

import type { ComponentType } from 'react';
import type { GameType } from '../types';
import type { TaskProps } from './types';
import WordChoiceTask from './WordChoiceTask';
import LetterChoiceTask from './LetterChoiceTask';
import WordInputTask from './WordInputTask';

export const TASK_COMPONENTS: Partial<Record<GameType, ComponentType<TaskProps>>> = {
  'word-choice': WordChoiceTask,
  'letter-choice': LetterChoiceTask,
  'word-input': WordInputTask,
};
