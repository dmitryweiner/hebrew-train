// Тесты для useScore

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScore } from '../useScore';
import type { GameType } from '../../types';

describe('useScore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('начальное состояние', () => {
    it('должен иметь нулевой счёт при инициализации', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      expect(result.current.currentCorrect).toBe(0);
      expect(result.current.currentTotal).toBe(0);
      expect(result.current.currentPercentage).toBe(0);
    });

    it('должен иметь пустую статистику игры', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      expect(result.current.gameStats).toEqual({ correct: 0, total: 0, percentage: 0 });
    });

    it('должен работать с null gameType', () => {
      const { result } = renderHook(() => useScore(null));
      
      expect(result.current.currentCorrect).toBe(0);
      expect(result.current.currentTotal).toBe(0);
    });
  });

  describe('добавление правильного ответа', () => {
    it('должен увеличивать счётчик правильных ответов', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
      });
      
      expect(result.current.currentCorrect).toBe(1);
      expect(result.current.currentTotal).toBe(1);
    });

    it('должен обновлять процент', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
      });
      
      expect(result.current.currentPercentage).toBe(100);
    });

    it('должен сохранять статистику в localStorage', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
      });
      
      expect(result.current.gameStats.correct).toBe(1);
      expect(result.current.gameStats.total).toBe(1);
      expect(result.current.gameStats.percentage).toBe(100);
    });

    it('должен накапливать правильные ответы', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
        result.current.addCorrect();
        result.current.addCorrect();
      });
      
      expect(result.current.currentCorrect).toBe(3);
      expect(result.current.currentTotal).toBe(3);
      expect(result.current.currentPercentage).toBe(100);
    });
  });

  describe('добавление неправильного ответа', () => {
    it('должен увеличивать общий счётчик', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addIncorrect();
      });
      
      expect(result.current.currentCorrect).toBe(0);
      expect(result.current.currentTotal).toBe(1);
    });

    it('должен обновлять процент', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addIncorrect();
      });
      
      expect(result.current.currentPercentage).toBe(0);
    });

    it('должен корректно вычислять процент при смешанных ответах', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
        result.current.addIncorrect();
        result.current.addCorrect();
        result.current.addIncorrect();
      });
      
      expect(result.current.currentCorrect).toBe(2);
      expect(result.current.currentTotal).toBe(4);
      expect(result.current.currentPercentage).toBe(50);
    });
  });

  describe('сброс текущего счёта', () => {
    it('должен сбрасывать текущую сессию', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
        result.current.addCorrect();
        result.current.addIncorrect();
      });
      
      act(() => {
        result.current.resetCurrentScore();
      });
      
      expect(result.current.currentCorrect).toBe(0);
      expect(result.current.currentTotal).toBe(0);
      expect(result.current.currentPercentage).toBe(0);
    });

    it('не должен сбрасывать сохранённую статистику', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
        result.current.addCorrect();
      });
      
      const savedStats = { ...result.current.gameStats };
      
      act(() => {
        result.current.resetCurrentScore();
      });
      
      expect(result.current.gameStats).toEqual(savedStats);
    });
  });

  describe('сброс всей статистики', () => {
    it('должен сбрасывать всю статистику', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
        result.current.addCorrect();
        result.current.addIncorrect();
      });
      
      act(() => {
        result.current.resetAllStats();
      });
      
      expect(result.current.currentCorrect).toBe(0);
      expect(result.current.currentTotal).toBe(0);
      expect(result.current.gameStats).toEqual({ correct: 0, total: 0, percentage: 0 });
    });
  });

  describe('сброс статистики конкретной игры', () => {
    it('должен сбрасывать статистику конкретной игры', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
        result.current.addCorrect();
      });
      
      act(() => {
        result.current.resetGameStats('letter-choice' as GameType);
      });
      
      expect(result.current.gameStats).toEqual({ correct: 0, total: 0, percentage: 0 });
    });
  });

  describe('общая статистика', () => {
    it('должен вычислять общую статистику по всем играм', () => {
      localStorage.clear();
      
      // Первая игра
      const { result: result1 } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result1.current.addCorrect();
      });
      
      // Общая статистика для letter-choice
      const totalStats = result1.current.totalStats;
      
      // letter-choice: 1/1
      expect(totalStats.correct).toBe(1);
      expect(totalStats.total).toBe(1);
      expect(totalStats.percentage).toBe(100);
    });

    it('должен возвращать нулевую статистику когда нет данных', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      expect(result.current.totalStats).toEqual({ correct: 0, total: 0, percentage: 0 });
    });
  });

  describe('работа с разными играми', () => {
    it('должен отдельно отслеживать статистику для разных игр', () => {
      const { result: result1 } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result1.current.addCorrect();
      });
      
      const { result: result2 } = renderHook(() => useScore('word-choice'));
      
      act(() => {
        result2.current.addIncorrect();
      });
      
      expect(result1.current.gameStats).toEqual({ correct: 1, total: 1, percentage: 100 });
      expect(result2.current.gameStats).toEqual({ correct: 0, total: 1, percentage: 0 });
    });

    it('должен загружать статистику из localStorage при смене игры', () => {
      localStorage.clear();
      
      const { result: result1, unmount: unmount1 } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result1.current.addCorrect();
      });
      
      // Проверяем что статистика сохранена
      expect(result1.current.gameStats.correct).toBe(1);
      expect(result1.current.gameStats.total).toBe(1);
      
      unmount1();
      
      // Новый инстанс хука должен загрузить данные из localStorage
      const { result: result2 } = renderHook(() => useScore('letter-choice'));
      
      // Статистика должна быть загружена из localStorage
      expect(result2.current.gameStats.correct).toBe(1);
      expect(result2.current.gameStats.total).toBe(1);
      expect(result2.current.gameStats.percentage).toBe(100);
    });
  });

  describe('сохранение lastSession', () => {
    it('должен сохранять дату последней сессии', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
      });
      
      expect(result.current.allStats.lastSession).toBeDefined();
      expect(typeof result.current.allStats.lastSession).toBe('string');
    });
  });

  describe('граничные случаи', () => {
    it('должен корректно обрабатывать большие числа', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addCorrect();
        }
      });
      
      expect(result.current.currentCorrect).toBe(100);
      expect(result.current.currentTotal).toBe(100);
      expect(result.current.currentPercentage).toBe(100);
    });

    it('должен корректно вычислять дробные проценты', () => {
      const { result } = renderHook(() => useScore('letter-choice'));
      
      act(() => {
        result.current.addCorrect();
        result.current.addIncorrect();
        result.current.addIncorrect();
      });
      
      expect(result.current.currentCorrect).toBe(1);
      expect(result.current.currentTotal).toBe(3);
      expect(result.current.currentPercentage).toBe(33); // округлено
    });
  });
});

