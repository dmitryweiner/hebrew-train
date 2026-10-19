// Хук раунда: очередь заданий + запись ответов в прогресс

import { useCallback, useState } from 'react';
import type { RoundKind } from '../types';
import type { WordResult } from '../core/progress';
import { GAME_CONFIG, type Task } from '../core/scheduler';
import { answerTask, currentTask, isFinished, startRound, touchedWords } from '../core/round';
import { useProgress } from '../state/progressContext';

export const useRound = (kind: RoundKind, tasks: Task[]) => {
  const { progress, recordAnswer } = useProgress();
  const [state, setState] = useState(() => startRound(kind, tasks, progress));

  const answer = useCallback((results: WordResult[]) => {
    const task = currentTask(state);
    if (!task) return;
    if (!task.retry) {
      // Коробка слова меняется только при первом показе в раунде
      const touched = touchedWords(state);
      const affectsBoxes = GAME_CONFIG[task.game].affectsBoxes;
      for (const result of results) {
        recordAnswer(task.game, result, affectsBoxes && !touched.has(result.wordId));
      }
    }
    setState(answerTask(state, results));
  }, [state, recordAnswer]);

  return {
    state,
    task: currentTask(state),
    finished: isFinished(state),
    answer,
  };
};
