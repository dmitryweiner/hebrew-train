// Выбор слов и составление заданий для раунда

import type { GameType, RoundKind, Word } from '../types';
import { shuffleArray } from '../utils/wordUtils';
import type { Day } from './dates';
import { isDue, type Box, type Progress } from './progress';

export interface Task {
  id: string;
  game: GameType;
  wordIds: string[];
  retry?: boolean;     // повтор слова после ошибки в этом же раунде: на счёт и коробки не влияет
}

export interface GameConfig {
  tasks: number;            // заданий в раунде
  wordsPerTask: number;
  minBox?: Box;             // для каких слов игра подходит
  maxBox?: Box;
  affectsBoxes: boolean;    // меняет ли игра коробки слов
  retryOnError: boolean;    // возвращать ли слово в этот же раунд после ошибки
}

export const GAME_CONFIG: Record<GameType, GameConfig> = {
  'letter-choice': { tasks: 10, wordsPerTask: 1, maxBox: 2, affectsBoxes: true, retryOnError: false },
  'word-choice': { tasks: 10, wordsPerTask: 1, affectsBoxes: true, retryOnError: true },
  'word-input': { tasks: 10, wordsPerTask: 1, minBox: 3, affectsBoxes: true, retryOnError: false },
  anagram: { tasks: 8, wordsPerTask: 1, minBox: 1, affectsBoxes: true, retryOnError: false },
  matching: { tasks: 3, wordsPerTask: 5, affectsBoxes: true, retryOnError: false },
  memory: { tasks: 1, wordsPerTask: 6, affectsBoxes: false, retryOnError: false },
  flashcards: { tasks: 10, wordsPerTask: 1, affectsBoxes: true, retryOnError: false },
  speed: { tasks: 1, wordsPerTask: 40, affectsBoxes: false, retryOnError: false },
  listen: { tasks: 10, wordsPerTask: 1, minBox: 1, affectsBoxes: true, retryOnError: true },
};

/** Новые слова по очереди из разных тем, чтобы первые раунды не состояли из одной еды */
export const interleaveByCategory = (words: Word[]): Word[] => {
  const groups = new Map<string, Word[]>();
  for (const w of words) groups.set(w.category, [...(groups.get(w.category) ?? []), w]);
  const lists = [...groups.values()];
  const result: Word[] = [];
  for (let i = 0; result.length < words.length; i++) {
    for (const list of lists) if (i < list.length) result.push(list[i]);
  }
  return result;
};

/** Сколько новых слов можно ввести за один раунд */
export const NEW_WORDS_PER_ROUND = 5;

export interface PickOptions {
  minBox?: Box;
  maxBox?: Box;
  newLimit?: number;
  exclude?: Set<string>;
}

/**
 * Выбирает слова для раунда в порядке приоритета:
 * 1) слова, которые пора повторить; 2) новые слова (не больше newLimit);
 * 3) давно не виденные знакомые слова; 4) любые оставшиеся, если подходящих не хватило.
 */
export const pickWords = (
  progress: Progress,
  words: Word[],
  count: number,
  today: Day,
  { minBox = 0, maxBox = 5, newLimit = NEW_WORDS_PER_ROUND, exclude = new Set() }: PickOptions = {}
): Word[] => {
  const boxOf = (w: Word): Box => progress.words[w.id]?.box ?? 0;
  const available = words.filter(w => !exclude.has(w.id));
  const inRange = available.filter(w => boxOf(w) >= minBox && boxOf(w) <= maxBox);

  const due = inRange
    .filter(w => isDue(progress.words[w.id], today))
    .sort((a, b) => progress.words[a.id].due.localeCompare(progress.words[b.id].due) || boxOf(a) - boxOf(b));
  const fresh = interleaveByCategory(inRange.filter(w => boxOf(w) === 0)).slice(0, newLimit);
  const rest = inRange
    .filter(w => boxOf(w) > 0 && !isDue(progress.words[w.id], today))
    .sort((a, b) => progress.words[a.id].lastSeen.localeCompare(progress.words[b.id].lastSeen));

  const picked: Word[] = [];
  const add = (list: Word[]) => {
    for (const w of list) {
      if (picked.length >= count) return;
      if (!picked.includes(w)) picked.push(w);
    }
  };
  add(due);
  add(fresh);
  add(rest);
  if (picked.length < count) {
    // Подходящих слов мало (например, для «Напиши слово» ещё ничего не выучено):
    // берём самые знакомые из оставшихся, затем новые
    add([...available].sort((a, b) => boxOf(b) - boxOf(a)));
  }
  return shuffleArray(picked);
};

let taskCounter = 0;
export const makeTask = (game: GameType, wordIds: string[], retry = false): Task => ({
  id: `t${++taskCounter}`,
  game,
  wordIds,
  retry,
});

const chunk = <T,>(list: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < list.length; i += size) result.push(list.slice(i, i + size));
  return result;
};

/** Задания одной игры для заданного набора слов */
export const tasksForWords = (game: GameType, wordIds: string[]): Task[] => {
  const { wordsPerTask } = GAME_CONFIG[game];
  if (wordsPerTask === 1) return wordIds.map(id => makeTask(game, [id]));
  // Для игр на пары нужен хотя бы минимум слов в задании, последний кусок объединяем с предыдущим
  const groups = chunk(wordIds, wordsPerTask);
  if (groups.length > 1 && groups[groups.length - 1].length < 3) {
    const last = groups.pop()!;
    groups[groups.length - 1].push(...last);
  }
  return groups.map(ids => makeTask(game, ids));
};

export interface RoundOptions {
  typing: boolean;      // разрешены задания с письмом
  tts: boolean;         // доступна озвучка
  wordIds?: string[];   // конкретные слова («Повторить ошибки», «Трудные слова»)
}

/** Минимум слов для игр на пары */
const MIN_GROUP: Partial<Record<GameType, number>> = { matching: 3, memory: 3, speed: 4 };

export const buildGameRound = (
  game: GameType,
  progress: Progress,
  words: Word[],
  today: Day,
  options: RoundOptions
): Task[] => {
  const config = GAME_CONFIG[game];
  if (options.wordIds?.length) {
    let ids = shuffleArray(options.wordIds.filter(id => words.some(w => w.id === id)));
    const min = MIN_GROUP[game] ?? 1;
    if (ids.length < min) {
      // Для пар нужно больше слов: добавляем знакомые
      const extra = pickWords(progress, words, min - ids.length, today, { exclude: new Set(ids), newLimit: 0 });
      ids = [...ids, ...extra.map(w => w.id)];
    }
    return game === 'speed' || game === 'memory'
      ? [makeTask(game, ids)]
      : tasksForWords(game, ids);
  }
  const count = config.tasks * config.wordsPerTask;
  const picked = pickWords(progress, words, count, today, {
    minBox: config.minBox,
    maxBox: config.maxBox,
    // В «Верно/Неверно» и «Мемори» новые слова не вводим: там нечему учиться с нуля
    newLimit: config.affectsBoxes ? NEW_WORDS_PER_ROUND : 0,
  });
  return tasksForWords(game, picked.map(w => w.id));
};

/**
 * «Тренировка дня»: новые слова через карточки и «Угадай букву»,
 * затем повторение по срокам в разных играх. Всего до 12 заданий.
 */
export const buildDailyRound = (
  progress: Progress,
  words: Word[],
  today: Day,
  options: RoundOptions
): Task[] => {
  const MAX_TASKS = 12;
  const boxOf = (id: string): Box => progress.words[id]?.box ?? 0;
  const dueCount = words.filter(w => isDue(progress.words[w.id], today)).length;
  const newCount = dueCount >= 8 ? 2 : dueCount >= 4 ? 3 : NEW_WORDS_PER_ROUND;

  const fresh = interleaveByCategory(words.filter(w => boxOf(w.id) === 0)).slice(0, newCount);
  const tasks: Task[] = [
    ...fresh.map(w => makeTask('flashcards', [w.id])),
    ...shuffleArray(fresh).map(w => makeTask('letter-choice', [w.id])),
  ];

  const reviewCount = Math.max(MAX_TASKS - tasks.length, 4);
  const review = pickWords(progress, words, reviewCount + 4, today, {
    minBox: 1,
    newLimit: 0,
    exclude: new Set(fresh.map(w => w.id)),
  }).filter(w => boxOf(w.id) > 0);

  if (review.length === 0) return tasks;

  const reviewTasks: Task[] = [];
  let pool = review;
  if (pool.length >= 6) {
    // Одна «Найди пары» на 4–5 слов разнообразит повторение
    const group = pool.slice(0, 5);
    reviewTasks.push(makeTask('matching', group.map(w => w.id)));
    pool = pool.slice(5);
  }
  const rotation: GameType[] = ['word-choice', 'anagram', 'word-choice'];
  if (options.tts) rotation.push('listen');
  const MAX_TYPING_TASKS = 2;
  let r = 0;
  let typingTasks = 0;
  for (const w of pool) {
    if (tasks.length + reviewTasks.length >= MAX_TASKS) break;
    // Письмо — только для хорошо знакомых слов и не больше двух заданий за тренировку
    const typing = options.typing && boxOf(w.id) >= 3 && typingTasks < MAX_TYPING_TASKS;
    if (typing) typingTasks++;
    reviewTasks.push(makeTask(typing ? 'word-input' : rotation[r++ % rotation.length], [w.id]));
  }
  return [...tasks, ...reviewTasks];
};

export const buildRound = (
  kind: RoundKind,
  progress: Progress,
  words: Word[],
  today: Day,
  options: RoundOptions
): Task[] =>
  kind === 'daily'
    ? options.wordIds?.length
      ? buildGameRound('word-choice', progress, words, today, options)
      : buildDailyRound(progress, words, today, options)
    : buildGameRound(kind, progress, words, today, options);
