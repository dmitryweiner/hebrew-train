import { describe, it, expect } from 'vitest';
import { pluralRu } from '../plural';

describe('pluralRu', () => {
  it.each([
    [1, 'ход'], [2, 'хода'], [4, 'хода'], [5, 'ходов'], [11, 'ходов'], [12, 'ходов'],
    [21, 'ход'], [22, 'хода'], [111, 'ходов'], [0, 'ходов'],
  ])('%i → %s', (n, expected) => {
    expect(pluralRu(n, 'ход', 'хода', 'ходов')).toBe(expected);
  });
});
