import { useRef, useEffect } from 'react';

/**
 * Хук для автоматического перехода к следующему раунду с возможностью отмены
 * 
 * @param onNext - Callback функция, которая будет вызвана при переходе к следующему раунду
 * @returns Объект с функциями для управления переходом
 */
export const useAutoNext = (onNext: () => void) => {
  const timerRef = useRef<number | null>(null);

  /**
   * Устанавливает автоматический переход через указанное время
   * @param delay - Задержка в миллисекундах
   */
  const scheduleNext = (delay: number) => {
    // Отменяем предыдущий таймер, если он был установлен
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      onNext();
      timerRef.current = null;
    }, delay);
  };

  /**
   * Немедленно переходит к следующему раунду, отменяя автоматический переход
   */
  const goNext = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onNext();
  };

  /**
   * Отменяет запланированный автоматический переход
   */
  const cancelNext = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    scheduleNext,
    goNext,
    cancelNext,
  };
};

