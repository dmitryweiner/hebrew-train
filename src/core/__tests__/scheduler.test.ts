import { describe, it, expect } from 'vitest';
import type { Word } from '../../types';
import { buildDailyRound, buildGameRound, interleaveByCategory, pickWords, tasksForWords } from '../scheduler';
import { createProgress, type Box, type Progress } from '../progress';
import { addDays } from '../dates';

const today = '2026-10-19';
const words: Word[] = Array.from({ length: 30 }, (_, i) => ({
  id: `w${i}`, emoji: String(i), hebrew: 'אבג', russian: `слово ${i}`, transliteration: 'abg', category: i % 2 ? 'food' : 'home',
}));

const withBoxes = (boxes: Record<string, [Box, string?]>): Progress => {
  const p = createProgress();
  for (const [id, [box, due = today]] of Object.entries(boxes)) {
    p.words[id] = { box, due, seen: 1, correct: 1, wrong: 0, lastSeen: addDays(today, -1) };
  }
  return p;
};

describe('interleaveByCategory', () => {
  it('чередует темы, сохраняя порядок внутри темы', () => {
    const byCategory = (ids: string[]) => ids.map(id => ({ ...words[0], id, category: id[0] }));
    const result = interleaveByCategory(byCategory(['a1', 'a2', 'a3', 'b1', 'c1', 'c2']));
    expect(result.map(w => w.id)).toEqual(['a1', 'b1', 'c1', 'a2', 'c2', 'a3']);
  });

  it('новые слова «Тренировки дня» — из разных тем, даже если в файле подряд одна тема', () => {
    const sorted = [...words].sort((a, b) => a.category.localeCompare(b.category));
    const tasks = buildDailyRound(createProgress(), sorted, today, { typing: true, tts: false });
    const fresh = tasks.filter(t => t.game === 'flashcards').map(t => sorted.find(w => w.id === t.wordIds[0])!.category);
    expect(new Set(fresh)).toEqual(new Set(['food', 'home']));
  });
});

describe('pickWords', () => {
  it('сначала слова к повторению, затем не больше 5 новых', () => {
    const p = withBoxes({ w10: [2], w11: [3], w12: [2, addDays(today, 3)] });
    const picked = pickWords(p, words, 7, today).map(w => w.id);
    expect(picked).toEqual(expect.arrayContaining(['w10', 'w11']));
    expect(picked.filter(id => !p.words[id]).length).toBe(5);
  });

  it('с нулевым лимитом новых добирает знакомыми, а при нехватке — новыми', () => {
    const p = withBoxes({ w1: [4, addDays(today, 5)] });
    const picked = pickWords(p, words, 3, today, { minBox: 3, newLimit: 0 }).map(w => w.id);
    expect(picked).toContain('w1');
    expect(picked).toHaveLength(3);
  });

  it('не повторяет слова и учитывает exclude', () => {
    const picked = pickWords(createProgress(), words, 10, today, { exclude: new Set(['w0']) }).map(w => w.id);
    expect(new Set(picked).size).toBe(picked.length);
    expect(picked).not.toContain('w0');
  });
});

describe('tasksForWords', () => {
  it('для пар группирует по 5 и не оставляет хвост меньше 3', () => {
    const tasks = tasksForWords('matching', ['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    expect(tasks.map(t => t.wordIds.length)).toEqual([7]);
    expect(tasksForWords('matching', Array.from({ length: 13 }, (_, i) => `${i}`)).map(t => t.wordIds.length)).toEqual([5, 5, 3]);
  });
});

describe('buildGameRound', () => {
  it('«Угадай слово» — 10 заданий по одному слову', () => {
    const tasks = buildGameRound('word-choice', createProgress(), words, today, { typing: true, tts: false });
    expect(tasks).toHaveLength(10);
    expect(tasks.every(t => t.game === 'word-choice' && t.wordIds.length === 1)).toBe(true);
  });

  it('«Повторить ошибки» строит раунд из указанных слов', () => {
    const tasks = buildGameRound('word-choice', createProgress(), words, today, { typing: true, tts: false, wordIds: ['w3', 'w4'] });
    expect(tasks.flatMap(t => t.wordIds).sort()).toEqual(['w3', 'w4']);
  });

  it('для пар добирает слова до минимума', () => {
    const tasks = buildGameRound('matching', createProgress(), words, today, { typing: true, tts: false, wordIds: ['w3'] });
    expect(tasks[0].wordIds.length).toBe(3);
    expect(tasks[0].wordIds).toContain('w3');
  });
});

describe('buildDailyRound', () => {
  it('для нового пользователя: 5 карточек и 5 «Угадай букву»', () => {
    const tasks = buildDailyRound(createProgress(), words, today, { typing: true, tts: false });
    expect(tasks.filter(t => t.game === 'flashcards')).toHaveLength(5);
    expect(tasks.filter(t => t.game === 'letter-choice')).toHaveLength(5);
  });

  it('при многих словах к повторению вводит меньше новых и не больше 12 заданий', () => {
    const boxes: Record<string, [Box]> = {};
    for (let i = 0; i < 15; i++) boxes[`w${i}`] = [3];
    const tasks = buildDailyRound(withBoxes(boxes), words, today, { typing: true, tts: true });
    expect(tasks.filter(t => t.game === 'flashcards')).toHaveLength(2);
    expect(tasks.length).toBeLessThanOrEqual(12);
    expect(tasks.some(t => t.game === 'matching')).toBe(true);
    expect(tasks.filter(t => t.game === 'word-input').length).toBeLessThanOrEqual(2);
  });

  it('без письма не даёт «Напиши слово»', () => {
    const boxes: Record<string, [Box]> = {};
    for (let i = 0; i < 15; i++) boxes[`w${i}`] = [4];
    const tasks = buildDailyRound(withBoxes(boxes), words, today, { typing: false, tts: false });
    expect(tasks.some(t => t.game === 'word-input')).toBe(false);
  });
});
