// Общий интерфейс компонента-задания

import type { Task } from '../core/scheduler';
import type { WordResult } from '../core/progress';

export interface TaskProps {
  task: Task;
  onDone: (results: WordResult[]) => void;
}
