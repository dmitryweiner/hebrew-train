import { describe, it, expect } from 'vitest';
import { answerTask, currentTask, isFinished, startRound, summarizeRound, touchedWords, RETRY_GAP } from '../round';
import { makeTask } from '../scheduler';
import { createProgress } from '../progress';

const tasks = () => ['a', 'b', 'c', 'd', 'e'].map(id => makeTask('word-choice', [id]));

describe('round', () => {
  it('ошибка в «Угадай слово» возвращает слово через несколько заданий', () => {
    let s = startRound('word-choice', tasks(), createProgress());
    s = answerTask(s, [{ wordId: 'a', correct: false }]);
    expect(s.tasks).toHaveLength(6);
    expect(s.tasks[1 + RETRY_GAP]).toMatchObject({ wordIds: ['a'], retry: true });
  });

  it('повтор после ошибки не влияет на счёт и не повторяется снова', () => {
    let s = startRound('word-choice', tasks().slice(0, 1), createProgress());
    s = answerTask(s, [{ wordId: 'a', correct: false }]);
    expect(currentTask(s)?.retry).toBe(true);
    s = answerTask(s, [{ wordId: 'a', correct: false }]);
    expect(isFinished(s)).toBe(true);
    expect(summarizeRound(s, createProgress())).toMatchObject({ correct: 0, total: 1, mistakes: ['a'] });
  });

  it('touchedWords не включает повторы и игры без влияния на коробки', () => {
    let s = startRound('daily', [makeTask('memory', ['x', 'y', 'z']), makeTask('word-choice', ['a'])], createProgress());
    s = answerTask(s, [{ wordId: 'x', correct: true }]);
    s = answerTask(s, [{ wordId: 'a', correct: true }]);
    expect([...touchedWords(s)]).toEqual(['a']);
  });

  it('итоги показывают слова, поднявшиеся на коробку выше', () => {
    const before = createProgress();
    let s = startRound('word-choice', tasks().slice(0, 2), before);
    s = answerTask(s, [{ wordId: 'a', correct: true }]);
    s = answerTask(s, [{ wordId: 'b', correct: false }]);
    const after = createProgress();
    after.words.a = { box: 1, due: '2026-10-19', seen: 1, correct: 1, wrong: 0, lastSeen: '2026-10-19' };
    const summary = summarizeRound(s, after);
    expect(summary.words.find(w => w.wordId === 'a')).toMatchObject({ correct: true, boxUp: true });
    expect(summary).toMatchObject({ correct: 1, total: 2, mistakes: ['b'] });
  });
});
