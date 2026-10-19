// Модель раунда: очередь заданий, ответы и итоги

import type { RoundKind } from '../types';
import type { Box, Progress, WordResult } from './progress';
import { GAME_CONFIG, makeTask, type Task } from './scheduler';

export interface TaskResult {
  task: Task;
  results: WordResult[];
}

export interface RoundState {
  kind: RoundKind;
  tasks: Task[];
  index: number;
  answers: TaskResult[];
  startBoxes: Record<string, Box>;   // коробки слов в начале раунда — для стрелок «↑» в итогах
}

/** Через сколько заданий вернуть слово после ошибки */
export const RETRY_GAP = 3;

export const startRound = (kind: RoundKind, tasks: Task[], progress: Progress): RoundState => {
  const startBoxes: Record<string, Box> = {};
  for (const task of tasks) {
    for (const id of task.wordIds) startBoxes[id] = progress.words[id]?.box ?? 0;
  }
  return { kind, tasks, index: 0, answers: [], startBoxes };
};

export const currentTask = (state: RoundState): Task | undefined => state.tasks[state.index];

export const isFinished = (state: RoundState): boolean => state.index >= state.tasks.length;

/** Записывает ответ на текущее задание и переходит к следующему */
export const answerTask = (state: RoundState, results: WordResult[]): RoundState => {
  const task = currentTask(state);
  if (!task) return state;
  const tasks = [...state.tasks];
  const wrong = results.filter(r => !r.correct);
  if (!task.retry && wrong.length > 0 && GAME_CONFIG[task.game].retryOnError) {
    const position = Math.min(state.index + 1 + RETRY_GAP, tasks.length);
    tasks.splice(position, 0, makeTask(task.game, wrong.map(r => r.wordId), true));
  }
  return { ...state, tasks, index: state.index + 1, answers: [...state.answers, { task, results }] };
};

/** Слова, коробку которых уже меняли в этом раунде (коробка меняется только при первом показе) */
export const touchedWords = (state: RoundState): Set<string> => {
  const touched = new Set<string>();
  for (const answer of state.answers) {
    if (answer.task.retry || !GAME_CONFIG[answer.task.game].affectsBoxes) continue;
    for (const r of answer.results) touched.add(r.wordId);
  }
  return touched;
};

export interface WordSummary {
  wordId: string;
  correct: boolean;
  boxUp: boolean;
  boxDown: boolean;
}

export interface RoundSummary {
  correct: number;
  total: number;
  words: WordSummary[];
  mistakes: string[];
}

/** Итоги раунда. Повторы после ошибок в счёт не входят. */
export const summarizeRound = (state: RoundState, progress: Progress): RoundSummary => {
  const counted = state.answers.filter(a => !a.task.retry).flatMap(a => a.results);
  const byWord = new Map<string, boolean>();
  for (const r of counted) byWord.set(r.wordId, (byWord.get(r.wordId) ?? true) && r.correct);

  const words: WordSummary[] = [...byWord.entries()].map(([wordId, correct]) => {
    const before = state.startBoxes[wordId] ?? 0;
    const after = progress.words[wordId]?.box ?? 0;
    return { wordId, correct, boxUp: after > before, boxDown: after < before };
  });

  return {
    correct: counted.filter(r => r.correct).length,
    total: counted.length,
    words,
    mistakes: words.filter(w => !w.correct).map(w => w.wordId),
  };
};
