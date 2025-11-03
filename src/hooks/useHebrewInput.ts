// Хук для работы с ивритским вводом

import { useState, useCallback } from 'react';
import { isHebrewText } from '../utils/hebrewUtils';

interface UseHebrewInputProps {
  maxLength?: number;
  onSubmit?: (value: string) => void;
}

export const useHebrewInput = ({ maxLength, onSubmit }: UseHebrewInputProps = {}) => {
  const [value, setValue] = useState<string>('');
  const [showWarning, setShowWarning] = useState<boolean>(false);

  // Обработка изменения значения
  const handleChange = useCallback((newValue: string) => {
    // Применяем ограничение длины, если указано
    const limitedValue = maxLength ? newValue.slice(0, maxLength) : newValue;
    setValue(limitedValue);

    // Показываем предупреждение, если ввод не на иврите
    if (limitedValue && !isHebrewText(limitedValue)) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [maxLength]);

  // Обработка нажатия клавиши Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit?.(value.trim());
    }
  }, [value, onSubmit]);

  // Сброс значения
  const reset = useCallback(() => {
    setValue('');
    setShowWarning(false);
  }, []);

  // Проверка, является ли текущее значение валидным ивритом
  const isValid = isHebrewText(value);

  return {
    value,
    setValue: handleChange,
    handleKeyDown,
    showWarning,
    isValid,
    reset,
    isEmpty: value.trim().length === 0,
  };
};

