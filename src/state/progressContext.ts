// Контекст прогресса пользователя

import { createContext, useContext } from 'react';
import type { RoundKind } from '../types';
import type { Progress, Settings, WordResult } from '../core/progress';
import type { Day } from '../core/dates';

export interface ProgressApi {
  progress: Progress;
  today: Day;
  recordAnswer: (kind: RoundKind, result: WordResult, moveBox: boolean) => void;
  recordRound: (kind: RoundKind, correct: number, total: number) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  resetProgress: () => void;
}

export const ProgressContext = createContext<ProgressApi | null>(null);

export const useProgress = (): ProgressApi => {
  const api = useContext(ProgressContext);
  if (!api) throw new Error('useProgress должен использоваться внутри ProgressProvider');
  return api;
};

export const useSettings = (): Settings => useProgress().progress.settings;
