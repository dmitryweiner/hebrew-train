import { describe, it, expect } from 'vitest';
import {
  applyWordAnswer, calcStars, createProgress, recordAnswer, recordRound, recentAccuracy,
  summarizeVocabulary, updateStreak, visibleStreak, type WordProgress,
} from '../progress';
import { addDays, daysBetween, toDay } from '../dates';

const today = '2026-10-19';
const wp = (box: WordProgress['box'], due = today): WordProgress =>
  ({ box, due, seen: 1, correct: 1, wrong: 0, lastSeen: '2026-10-01' });

describe('dates', () => {
  it('addDays и daysBetween переходят через границу месяца', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(daysBetween('2026-10-30', '2026-11-02')).toBe(3);
  });
  it('toDay использует местное время', () => {
    expect(toDay(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('applyWordAnswer', () => {
  it('новое слово при любом ответе попадает в коробку 1', () => {
    expect(applyWordAnswer(undefined, true, today).box).toBe(1);
    expect(applyWordAnswer(undefined, false, today).box).toBe(1);
  });

  it('правильный ответ в срок поднимает коробку и назначает повторение', () => {
    const next = applyWordAnswer(wp(2), true, today);
    expect(next.box).toBe(3);
    expect(next.due).toBe(addDays(today, 3));
  });

  it('правильный ответ до срока не поднимает коробку', () => {
    const next = applyWordAnswer(wp(3, addDays(today, 2)), true, today);
    expect(next.box).toBe(3);
    expect(next.correct).toBe(2);
  });

  it('ошибка опускает на одну коробку, но не ниже 1, и делает слово срочным', () => {
    expect(applyWordAnswer(wp(4, addDays(today, 5)), false, today)).toMatchObject({ box: 3, due: today });
    expect(applyWordAnswer(wp(1), false, today).box).toBe(1);
  });

  it('коробка 5 остаётся пятой', () => {
    expect(applyWordAnswer(wp(5), true, today)).toMatchObject({ box: 5, due: addDays(today, 30) });
  });
});

describe('recordAnswer / recordRound', () => {
  it('считает ответы по игре и по дню, коробку меняет только при moveBox', () => {
    let p = createProgress();
    p = recordAnswer(p, 'word-choice', { wordId: 'apple', correct: true }, today, true);
    p = recordAnswer(p, 'word-choice', { wordId: 'bread', correct: false }, today, false);
    expect(p.words.apple.box).toBe(1);
    expect(p.words.bread).toBeUndefined();
    expect(p.games['word-choice']).toMatchObject({ totalCorrect: 1, totalAnswers: 2 });
    expect(p.days[today]).toMatchObject({ correct: 1, total: 2 });
  });

  it('раунд обновляет лучший результат, звёзды, день и серию', () => {
    let p = createProgress();
    p = recordRound(p, 'word-choice', 8, 10, today);
    p = recordRound(p, 'word-choice', 6, 10, today);
    expect(p.games['word-choice']).toMatchObject({ rounds: 2, bestCorrect: 8, bestTotal: 10, lastStars: 1 });
    p = recordRound(p, 'daily', 10, 10, today);
    expect(p.days[today]).toMatchObject({ rounds: 3, daily: true });
    expect(p.streak).toMatchObject({ current: 1, lastDay: today });
  });

  it('для «Верно/Неверно» лучший результат — рекорд очков', () => {
    let p = createProgress();
    p = recordRound(p, 'speed', 12, 15, today);
    p = recordRound(p, 'speed', 9, 9, today);
    expect(p.games.speed).toMatchObject({ bestCorrect: 12, bestTotal: 12 });
  });
});

describe('звёзды и серия', () => {
  it('calcStars', () => {
    expect(calcStars(10, 10)).toBe(3);
    expect(calcStars(8, 10)).toBe(2);
    expect(calcStars(7, 10)).toBe(1);
    expect(calcStars(0, 0)).toBe(1);
  });

  it('updateStreak продолжает серию на следующий день и сбрасывает после пропуска', () => {
    let s = updateStreak({ current: 0, best: 0, lastDay: null }, today);
    s = updateStreak(s, today);
    expect(s.current).toBe(1);
    s = updateStreak(s, addDays(today, 1));
    expect(s).toMatchObject({ current: 2, best: 2 });
    s = updateStreak(s, addDays(today, 3));
    expect(s).toMatchObject({ current: 1, best: 2 });
  });

  it('visibleStreak гаснет, если вчера не занимались', () => {
    const s = { current: 4, best: 4, lastDay: today };
    expect(visibleStreak(s, addDays(today, 1))).toBe(4);
    expect(visibleStreak(s, addDays(today, 2))).toBe(0);
  });
});

describe('сводки', () => {
  it('recentAccuracy учитывает только последние 7 дней', () => {
    const game = {
      rounds: 0, bestCorrect: 0, bestTotal: 0, lastStars: 0 as const, totalCorrect: 0, totalAnswers: 0,
      answers: [{ d: addDays(today, -10), c: 0, t: 10 }, { d: today, c: 3, t: 4 }],
    };
    expect(recentAccuracy(game, today)).toBe(75);
    expect(recentAccuracy(undefined, today)).toBeNull();
  });

  it('summarizeVocabulary раскладывает слова по группам', () => {
    const p = createProgress();
    p.words = { a: wp(5), b: wp(2), c: wp(1, addDays(today, 1)) };
    expect(summarizeVocabulary(p, ['a', 'b', 'c', 'd'], today)).toEqual({ learned: 1, learning: 2, fresh: 1, due: 2 });
  });
});
