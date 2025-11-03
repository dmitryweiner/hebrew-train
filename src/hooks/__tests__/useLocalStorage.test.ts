// Тесты для useLocalStorage

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, removeFromLocalStorage, clearLocalStorage, isLocalStorageAvailable } from '../useLocalStorage';

describe('useLocalStorage', () => {
  const TEST_KEY = 'test-key';

  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('базовая функциональность', () => {
    it('должен возвращать начальное значение при первом рендере', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));
      
      expect(result.current[0]).toBe('initial');
    });

    it('должен обновлять значение', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));
      
      act(() => {
        result.current[1]('updated');
      });
      
      expect(result.current[0]).toBe('updated');
    });

    it('должен сохранять значение в localStorage', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'test'));
      
      act(() => {
        result.current[1]('saved');
      });
      
      const saved = localStorage.getItem(TEST_KEY);
      expect(saved).toBe(JSON.stringify('saved'));
    });

    it('должен загружать значение из localStorage', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify('stored'));
      
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));
      
      expect(result.current[0]).toBe('stored');
    });
  });

  describe('работа с разными типами данных', () => {
    it('должен работать со строками', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'string'));
      
      act(() => {
        result.current[1]('new string');
      });
      
      expect(result.current[0]).toBe('new string');
    });

    it('должен работать с числами', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 0));
      
      act(() => {
        result.current[1](42);
      });
      
      expect(result.current[0]).toBe(42);
    });

    it('должен работать с объектами', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, { count: 0 }));
      
      act(() => {
        result.current[1]({ count: 10 });
      });
      
      expect(result.current[0]).toEqual({ count: 10 });
    });

    it('должен работать с массивами', () => {
      const { result } = renderHook(() => useLocalStorage<number[]>(TEST_KEY, []));
      
      act(() => {
        result.current[1]([1, 2, 3]);
      });
      
      expect(result.current[0]).toEqual([1, 2, 3]);
    });

    it('должен работать с boolean', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, false));
      
      act(() => {
        result.current[1](true);
      });
      
      expect(result.current[0]).toBe(true);
    });

    it('должен работать с null', () => {
      const { result } = renderHook(() => useLocalStorage<string | null>(TEST_KEY, null));
      
      expect(result.current[0]).toBeNull();
      
      act(() => {
        result.current[1]('not null');
      });
      
      expect(result.current[0]).toBe('not null');
    });
  });

  describe('функциональное обновление', () => {
    it('должен поддерживать функциональное обновление', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 0));
      
      act(() => {
        result.current[1](prev => prev + 1);
      });
      
      expect(result.current[0]).toBe(1);
      
      act(() => {
        result.current[1](prev => prev + 1);
      });
      
      expect(result.current[0]).toBe(2);
    });

    it('должен работать с функциональным обновлением объектов', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, { count: 0, name: 'test' }));
      
      act(() => {
        result.current[1](prev => ({ ...prev, count: prev.count + 1 }));
      });
      
      expect(result.current[0]).toEqual({ count: 1, name: 'test' });
    });
  });

  describe('обработка ошибок', () => {
    it('должен возвращать начальное значение при ошибке чтения', () => {
      localStorage.setItem(TEST_KEY, 'invalid json{');
      
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'fallback'));
      
      expect(result.current[0]).toBe('fallback');
    });

    it('должен обрабатывать ошибки сохранения', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'test'));
      
      // Мокируем ошибку setItem
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      act(() => {
        result.current[1]('should fail');
      });
      
      // Значение должно обновиться в state, несмотря на ошибку localStorage
      expect(result.current[0]).toBe('should fail');
      
      setItemSpy.mockRestore();
    });
  });

  describe('синхронизация между рендерами', () => {
    it('должен сохранять значение между перемонтированиями', () => {
      const { result: result1 } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));
      
      act(() => {
        result1.current[1]('persisted');
      });
      
      const { result: result2 } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));
      
      expect(result2.current[0]).toBe('persisted');
    });
  });

  describe('removeFromLocalStorage', () => {
    it('должен удалять значение из localStorage', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify('test'));
      
      removeFromLocalStorage(TEST_KEY);
      
      expect(localStorage.getItem(TEST_KEY)).toBeNull();
    });

    it('должен корректно работать с несуществующим ключом', () => {
      expect(() => removeFromLocalStorage('nonexistent')).not.toThrow();
    });
  });

  describe('clearLocalStorage', () => {
    it('должен очищать весь localStorage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      
      clearLocalStorage();
      
      expect(localStorage.length).toBe(0);
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('должен возвращать true когда localStorage доступен', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('должен возвращать false когда localStorage недоступен', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Not available');
      });
      
      expect(isLocalStorageAvailable()).toBe(false);
      
      setItemSpy.mockRestore();
    });
  });
});

