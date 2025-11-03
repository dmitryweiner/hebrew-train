// Хук для работы с LocalStorage

import { useState } from 'react';

/**
 * Хук для работы с LocalStorage с автоматической сериализацией/десериализацией
 * @param key - ключ в LocalStorage
 * @param initialValue - начальное значение
 * @returns [значение, функция установки значения]
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Получаем значение из localStorage при инициализации
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Функция для установки значения
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Поддержка функционального обновления
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Сохраняем в localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Удаляет значение из localStorage
 * @param key - ключ для удаления
 */
export const removeFromLocalStorage = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

/**
 * Очищает весь localStorage
 */
export const clearLocalStorage = (): void => {
  try {
    window.localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Проверяет, доступен ли localStorage
 * @returns true если localStorage доступен
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

