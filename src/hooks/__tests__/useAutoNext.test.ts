import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoNext } from '../useAutoNext';

describe('useAutoNext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('должен вызывать callback при scheduleNext после указанной задержки', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useAutoNext(mockCallback));

    act(() => {
      result.current.scheduleNext(1000);
    });

    expect(mockCallback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('должен немедленно вызывать callback при goNext', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useAutoNext(mockCallback));

    act(() => {
      result.current.goNext();
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('должен отменять предыдущий таймер при вызове scheduleNext несколько раз', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useAutoNext(mockCallback));

    act(() => {
      result.current.scheduleNext(1000);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Устанавливаем новый таймер до того, как сработал первый
    act(() => {
      result.current.scheduleNext(1000);
    });

    // Продвигаем время на оставшиеся 500ms от первого таймера
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Callback не должен быть вызван, так как первый таймер был отменён
    expect(mockCallback).not.toHaveBeenCalled();

    // Продвигаем время ещё на 500ms (всего 1000ms от второго таймера)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Теперь callback должен быть вызван один раз
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('должен отменять таймер при вызове goNext', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useAutoNext(mockCallback));

    act(() => {
      result.current.scheduleNext(1000);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Вызываем goNext до того, как сработал таймер
    act(() => {
      result.current.goNext();
    });

    // Callback должен быть вызван один раз (из goNext)
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Продвигаем время, чтобы убедиться, что таймер был отменён
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Callback не должен быть вызван повторно
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('должен отменять таймер при вызове cancelNext', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useAutoNext(mockCallback));

    act(() => {
      result.current.scheduleNext(1000);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Отменяем таймер
    act(() => {
      result.current.cancelNext();
    });

    // Продвигаем время до конца
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Callback не должен быть вызван
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('должен очищать таймер при размонтировании', () => {
    const mockCallback = vi.fn();
    const { result, unmount } = renderHook(() => useAutoNext(mockCallback));

    act(() => {
      result.current.scheduleNext(1000);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Размонтируем хук
    unmount();

    // Продвигаем время до конца
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Callback не должен быть вызван после размонтирования
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('должен работать с разными задержками', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useAutoNext(mockCallback));

    // Первый вызов с задержкой 500ms
    act(() => {
      result.current.scheduleNext(500);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Второй вызов с задержкой 2000ms
    act(() => {
      result.current.scheduleNext(2000);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockCallback).toHaveBeenCalledTimes(2);
  });

  it('должен работать при вызове goNext без предварительного scheduleNext', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useAutoNext(mockCallback));

    act(() => {
      result.current.goNext();
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('должен работать при вызове cancelNext без предварительного scheduleNext', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useAutoNext(mockCallback));

    // Не должно быть ошибок
    act(() => {
      result.current.cancelNext();
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });
});

