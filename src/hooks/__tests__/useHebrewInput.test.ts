// Тесты для useHebrewInput

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHebrewInput } from '../useHebrewInput';

describe('useHebrewInput', () => {
  describe('начальное состояние', () => {
    it('должен иметь пустое значение при инициализации', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      expect(result.current.value).toBe('');
      expect(result.current.isEmpty).toBe(true);
    });

    it('не должен показывать предупреждение при инициализации', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      expect(result.current.showWarning).toBe(false);
    });

    it('должен быть валидным при пустом значении', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('изменение значения', () => {
    it('должен обновлять значение', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('שלום');
      });
      
      expect(result.current.value).toBe('שלום');
      expect(result.current.isEmpty).toBe(false);
    });

    it('должен принимать ивритский текст', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('תפוח');
      });
      
      expect(result.current.value).toBe('תפוח');
      expect(result.current.showWarning).toBe(false);
      expect(result.current.isValid).toBe(true);
    });

    it('должен показывать предупреждение для не-ивритского текста', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('hello');
      });
      
      expect(result.current.showWarning).toBe(true);
      expect(result.current.isValid).toBe(false);
    });

    it('должен показывать предупреждение для смешанного текста', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('hello שלום');
      });
      
      expect(result.current.showWarning).toBe(true);
      expect(result.current.isValid).toBe(false);
    });

    it('должен скрывать предупреждение при вводе иврита', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('hello');
      });
      
      expect(result.current.showWarning).toBe(true);
      
      act(() => {
        result.current.setValue('שלום');
      });
      
      expect(result.current.showWarning).toBe(false);
    });
  });

  describe('ограничение длины', () => {
    it('должен применять maxLength', () => {
      const { result } = renderHook(() => useHebrewInput({ maxLength: 3 }));
      
      act(() => {
        result.current.setValue('שלום');
      });
      
      expect(result.current.value).toBe('שלו');
      expect(result.current.value.length).toBe(3);
    });

    it('должен работать без maxLength', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('שלום עולם');
      });
      
      expect(result.current.value).toBe('שלום עולם');
    });

    it('maxLength = 1 должен разрешать только одну букву', () => {
      const { result } = renderHook(() => useHebrewInput({ maxLength: 1 }));
      
      act(() => {
        result.current.setValue('שלום');
      });
      
      expect(result.current.value).toBe('ש');
    });
  });

  describe('обработка нажатия Enter', () => {
    it('должен вызывать onSubmit при нажатии Enter', () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() => useHebrewInput({ onSubmit }));
      
      act(() => {
        result.current.setValue('שלום');
      });
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
      
      act(() => {
        result.current.handleKeyDown(event);
      });
      
      expect(onSubmit).toHaveBeenCalledWith('שלום');
    });

    it('не должен вызывать onSubmit для других клавиш', () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() => useHebrewInput({ onSubmit }));
      
      act(() => {
        result.current.setValue('שלום');
      });
      
      const event = new KeyboardEvent('keydown', { key: 'a' }) as any;
      
      act(() => {
        result.current.handleKeyDown(event);
      });
      
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('не должен вызывать onSubmit для пустого значения', () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() => useHebrewInput({ onSubmit }));
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
      
      act(() => {
        result.current.handleKeyDown(event);
      });
      
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('должен вызывать onSubmit с trimmed значением', () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() => useHebrewInput({ onSubmit }));
      
      act(() => {
        result.current.setValue('  שלום  ');
      });
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
      
      act(() => {
        result.current.handleKeyDown(event);
      });
      
      expect(onSubmit).toHaveBeenCalledWith('שלום');
    });
  });

  describe('сброс значения', () => {
    it('должен сбрасывать значение', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('שלום');
      });
      
      expect(result.current.value).toBe('שלום');
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.value).toBe('');
      expect(result.current.isEmpty).toBe(true);
    });

    it('должен скрывать предупреждение при сбросе', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('hello');
      });
      
      expect(result.current.showWarning).toBe(true);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.showWarning).toBe(false);
    });
  });

  describe('свойство isEmpty', () => {
    it('должно быть true для пустой строки', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      expect(result.current.isEmpty).toBe(true);
    });

    it('должно быть true для строки из пробелов', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('   ');
      });
      
      expect(result.current.isEmpty).toBe(true);
    });

    it('должно быть false для непустой строки', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('ש');
      });
      
      expect(result.current.isEmpty).toBe(false);
    });
  });

  describe('валидация', () => {
    it('isValid должен быть true для ивритского текста', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('שלום עולם');
      });
      
      expect(result.current.isValid).toBe(true);
    });

    it('isValid должен быть false для не-ивритского текста', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('hello');
      });
      
      expect(result.current.isValid).toBe(false);
    });

    it('isValid должен быть true для пустого текста', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      expect(result.current.isValid).toBe(true);
      
      act(() => {
        result.current.setValue('');
      });
      
      expect(result.current.isValid).toBe(true);
    });

    it('isValid должен быть true для текста с пробелами', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('שלום עולם');
      });
      
      expect(result.current.isValid).toBe(true);
    });

    it('isValid должен быть false для смешанного текста', () => {
      const { result } = renderHook(() => useHebrewInput());
      
      act(() => {
        result.current.setValue('שלום123');
      });
      
      expect(result.current.isValid).toBe(false);
    });
  });
});

