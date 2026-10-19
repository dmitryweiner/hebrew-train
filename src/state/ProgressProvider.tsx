// Хранилище прогресса: useReducer поверх localStorage

import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { RoundKind } from '../types';
import {
  createProgress, recordAnswer, recordRound, type Progress, type Settings, type WordResult,
} from '../core/progress';
import { loadProgress, saveProgress } from '../core/storage';
import { toDay, type Day } from '../core/dates';
import { ProgressContext, type ProgressApi } from './progressContext';

type Action =
  | { type: 'answer'; kind: RoundKind; result: WordResult; moveBox: boolean; today: Day }
  | { type: 'round'; kind: RoundKind; correct: number; total: number; today: Day }
  | { type: 'settings'; settings: Partial<Settings> }
  | { type: 'reset' };

const reducer = (state: Progress, action: Action): Progress => {
  switch (action.type) {
    case 'answer':
      return recordAnswer(state, action.kind, action.result, action.today, action.moveBox);
    case 'round':
      return recordRound(state, action.kind, action.correct, action.total, action.today);
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'reset':
      return { ...createProgress(), settings: state.settings };
  }
};

interface ProgressProviderProps {
  children: ReactNode;
  initialProgress?: Progress;
}

export const ProgressProvider = ({ children, initialProgress }: ProgressProviderProps) => {
  const [progress, dispatch] = useReducer(reducer, initialProgress, init => init ?? loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(progress.settings.fontScale));
  }, [progress.settings.fontScale]);

  const today = toDay();

  const recordAnswerCb = useCallback((kind: RoundKind, result: WordResult, moveBox: boolean) =>
    dispatch({ type: 'answer', kind, result, moveBox, today: toDay() }), []);
  const recordRoundCb = useCallback((kind: RoundKind, correct: number, total: number) =>
    dispatch({ type: 'round', kind, correct, total, today: toDay() }), []);
  const updateSettings = useCallback((settings: Partial<Settings>) => dispatch({ type: 'settings', settings }), []);
  const resetProgress = useCallback(() => dispatch({ type: 'reset' }), []);

  const api = useMemo<ProgressApi>(() => ({
    progress,
    today,
    recordAnswer: recordAnswerCb,
    recordRound: recordRoundCb,
    updateSettings,
    resetProgress,
  }), [progress, today, recordAnswerCb, recordRoundCb, updateSettings, resetProgress]);

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
};
