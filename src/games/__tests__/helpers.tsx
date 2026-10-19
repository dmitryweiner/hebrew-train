// Вспомогательные функции для тестов игр

import { render } from '@testing-library/react';
import type { ComponentType } from 'react';
import { vi } from 'vitest';
import type { GameType } from '../../types';
import { makeTask } from '../../core/scheduler';
import { createProgress, type Progress } from '../../core/progress';
import { ProgressProvider } from '../../state/ProgressProvider';
import type { TaskProps } from '../types';

export const renderTask = (
  Component: ComponentType<TaskProps>,
  game: GameType,
  wordIds: string[],
  progress: Progress = createProgress()
) => {
  const onDone = vi.fn();
  const task = makeTask(game, wordIds);
  const utils = render(
    <ProgressProvider initialProgress={progress}>
      <Component task={task} onDone={onDone} />
    </ProgressProvider>
  );
  return { ...utils, onDone };
};

export const progressWithBox = (wordId: string, box: 1 | 2 | 3 | 4 | 5): Progress => {
  const p = createProgress();
  p.words[wordId] = { box, due: '2000-01-01', seen: 1, correct: 1, wrong: 0, lastSeen: '2000-01-01' };
  return p;
};
