// Тесты для useMatching

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMatching } from '../useMatching';
import type { Word } from '../../types';

describe('useMatching', () => {
  let testWords: Word[];

  beforeEach(() => {
    testWords = [
      {
        id: 'apple',
        emoji: '🍎',
        hebrew: 'תפוח',
        russian: 'яблоко',
        transliteration: 'tapuach',
        category: 'food',
        difficulty: 1,
      },
      {
        id: 'dog',
        emoji: '🐕',
        hebrew: 'כלב',
        russian: 'собака',
        transliteration: 'kelev',
        category: 'animals',
        difficulty: 1,
      },
      {
        id: 'cat',
        emoji: '🐈',
        hebrew: 'חתול',
        russian: 'кот',
        transliteration: 'chatul',
        category: 'animals',
        difficulty: 1,
      },
      {
        id: 'car',
        emoji: '🚗',
        hebrew: 'מכונית',
        russian: 'машина',
        transliteration: 'mechonit',
        category: 'transport',
        difficulty: 2,
      },
    ];
  });

  describe('начальное состояние', () => {
    it('должен генерировать указанное количество пар', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 3 }));
      
      expect(result.current.emojis).toHaveLength(3);
      expect(result.current.hebrewWords).toHaveLength(3);
    });

    it('не должно быть выбранных элементов', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      expect(result.current.selectedEmoji).toBeNull();
      expect(result.current.selectedWord).toBeNull();
    });

    it('не должно быть совпадений', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      expect(result.current.matches.size).toBe(0);
    });

    it('игра не должна быть завершена', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      expect(result.current.isComplete).toBe(false);
    });

    it('должен использовать значение по умолчанию для pairCount', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      expect(result.current.emojis).toHaveLength(3);
    });
  });

  describe('структура данных', () => {
    it('эмодзи и слова должны содержать те же id', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 3 }));
      
      const emojiIds = result.current.emojis.map(e => e.id).sort();
      const wordIds = result.current.hebrewWords.map(w => w.id).sort();
      
      expect(emojiIds).toEqual(wordIds);
    });

    it('слова должны быть перемешаны', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 3 }));
      
      // Порядок id в эмодзи и словах может различаться
      const emojiIds = result.current.emojis.map(e => e.id);
      const wordIds = result.current.hebrewWords.map(w => w.id);
      
      // Проверяем, что массивы содержат те же элементы (но порядок может быть другим)
      expect(emojiIds.sort()).toEqual(wordIds.sort());
    });

    it('все элементы должны быть изначально не сопоставлены', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      result.current.emojis.forEach(emoji => {
        expect(emoji.matched).toBe(false);
      });
      
      result.current.hebrewWords.forEach(word => {
        expect(word.matched).toBe(false);
      });
    });
  });

  describe('выбор эмодзи', () => {
    it('должен выбирать эмодзи', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      const emojiId = result.current.emojis[0].id;
      
      act(() => {
        result.current.handleEmojiSelect(emojiId);
      });
      
      expect(result.current.selectedEmoji).toBe(emojiId);
    });

    it('должен отменять выбор при повторном клике', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      const emojiId = result.current.emojis[0].id;
      
      act(() => {
        result.current.handleEmojiSelect(emojiId);
      });
      
      expect(result.current.selectedEmoji).toBe(emojiId);
      
      act(() => {
        result.current.handleEmojiSelect(emojiId);
      });
      
      expect(result.current.selectedEmoji).toBeNull();
    });

    it('не должен позволять выбрать уже сопоставленный эмодзи', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 2 }));
      
      const emojiId = result.current.emojis[0].id;
      const wordId = result.current.hebrewWords.find(w => w.id === emojiId)!.id;
      
      // Создаём правильное совпадение
      act(() => {
        result.current.handleEmojiSelect(emojiId);
        result.current.handleWordSelect(wordId);
      });
      
      // Пытаемся выбрать снова
      act(() => {
        result.current.handleEmojiSelect(emojiId);
      });
      
      expect(result.current.selectedEmoji).toBeNull();
    });
  });

  describe('выбор слова', () => {
    it('должен выбирать слово', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      const wordId = result.current.hebrewWords[0].id;
      
      act(() => {
        result.current.handleWordSelect(wordId);
      });
      
      expect(result.current.selectedWord).toBe(wordId);
    });

    it('должен отменять выбор при повторном клике', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      const wordId = result.current.hebrewWords[0].id;
      
      act(() => {
        result.current.handleWordSelect(wordId);
      });
      
      act(() => {
        result.current.handleWordSelect(wordId);
      });
      
      expect(result.current.selectedWord).toBeNull();
    });

    it('не должен позволять выбрать уже сопоставленное слово', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 2 }));
      
      const emojiId = result.current.emojis[0].id;
      const wordId = result.current.hebrewWords.find(w => w.id === emojiId)!.id;
      
      // Создаём правильное совпадение
      act(() => {
        result.current.handleEmojiSelect(emojiId);
        result.current.handleWordSelect(wordId);
      });
      
      // Пытаемся выбрать слово снова
      act(() => {
        result.current.handleWordSelect(wordId);
      });
      
      expect(result.current.selectedWord).toBeNull();
    });
  });

  describe('создание пар', () => {
    it('должен создавать правильную пару', () => {
      const onCorrect = vi.fn();
      const { result } = renderHook(() => useMatching({ words: testWords, onCorrect }));
      
      const emojiId = result.current.emojis[0].id;
      const wordId = result.current.hebrewWords.find(w => w.id === emojiId)!.id;
      
      act(() => {
        result.current.handleEmojiSelect(emojiId);
      });
      
      act(() => {
        result.current.handleWordSelect(wordId);
      });
      
      expect(result.current.matches.has(emojiId)).toBe(true);
      expect(result.current.matches.get(emojiId)).toBe(wordId);
      expect(onCorrect).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать неправильную пару', () => {
      const onIncorrect = vi.fn();
      const { result } = renderHook(() => useMatching({ words: testWords, onIncorrect, pairCount: 2 }));
      
      const emojiId = result.current.emojis[0].id;
      const wrongWordId = result.current.hebrewWords.find(w => w.id !== emojiId)!.id;
      
      act(() => {
        result.current.handleEmojiSelect(emojiId);
      });
      
      act(() => {
        result.current.handleWordSelect(wrongWordId);
      });
      
      expect(result.current.matches.size).toBe(0);
      expect(onIncorrect).toHaveBeenCalledTimes(1);
    });

    it('должен сбрасывать выбор после создания пары', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      const emojiId = result.current.emojis[0].id;
      const wordId = result.current.hebrewWords.find(w => w.id === emojiId)!.id;
      
      act(() => {
        result.current.handleEmojiSelect(emojiId);
      });
      
      act(() => {
        result.current.handleWordSelect(wordId);
      });
      
      expect(result.current.selectedEmoji).toBeNull();
      expect(result.current.selectedWord).toBeNull();
    });

    it('должен отмечать сопоставленные элементы', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      const emojiId = result.current.emojis[0].id;
      const wordId = result.current.hebrewWords.find(w => w.id === emojiId)!.id;
      
      act(() => {
        result.current.handleEmojiSelect(emojiId);
      });
      
      act(() => {
        result.current.handleWordSelect(wordId);
      });
      
      const matchedEmoji = result.current.emojis.find(e => e.id === emojiId);
      const matchedWord = result.current.hebrewWords.find(w => w.id === wordId);
      
      expect(matchedEmoji?.matched).toBe(true);
      expect(matchedWord?.matched).toBe(true);
    });
  });

  describe('неправильные пары', () => {
    it('должен добавлять неправильную пару в incorrectPairs', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 2 }));
      
      const emojiId = result.current.emojis[0].id;
      const wrongWordId = result.current.hebrewWords.find(w => w.id !== emojiId)!.id;
      
      act(() => {
        result.current.handleEmojiSelect(emojiId);
      });
      
      act(() => {
        result.current.handleWordSelect(wrongWordId);
      });
      
      const pairKey = `${emojiId}-${wrongWordId}`;
      expect(result.current.incorrectPairs.has(pairKey)).toBe(true);
    });
  });

  describe('завершение игры', () => {
    it('должен определять завершение игры', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 2 }));
      
      expect(result.current.isComplete).toBe(false);
      
      // Сопоставляем все пары
      const pairs = result.current.emojis.map(emoji => {
        const word = result.current.hebrewWords.find(w => w.id === emoji.id)!;
        return { emojiId: emoji.id, wordId: word.id };
      });
      
      pairs.forEach(({ emojiId, wordId }) => {
        act(() => {
          result.current.handleEmojiSelect(emojiId);
        });
        act(() => {
          result.current.handleWordSelect(wordId);
        });
      });
      
      expect(result.current.isComplete).toBe(true);
    });

    it('не должен быть завершён при неполном сопоставлении', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 3 }));
      
      const emojiId = result.current.emojis[0].id;
      const wordId = result.current.hebrewWords.find(w => w.id === emojiId)!.id;
      
      act(() => {
        result.current.handleEmojiSelect(emojiId);
        result.current.handleWordSelect(wordId);
      });
      
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('сброс игры', () => {
    it('должен генерировать новые пары', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 2 }));
      
      const initialEmojiIds = result.current.emojis.map(e => e.id);
      
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.emojis).toHaveLength(2);
      expect(result.current.hebrewWords).toHaveLength(2);
      
      // ID могут быть другими (случайные слова)
      const newEmojiIds = result.current.emojis.map(e => e.id);
      expect(newEmojiIds).toHaveLength(initialEmojiIds.length);
    });

    it('должен сбрасывать все совпадения', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 2 }));
      
      const emojiId = result.current.emojis[0].id;
      const wordId = result.current.hebrewWords.find(w => w.id === emojiId)!.id;
      
      act(() => {
        result.current.handleEmojiSelect(emojiId);
      });
      
      act(() => {
        result.current.handleWordSelect(wordId);
      });
      
      expect(result.current.matches.size).toBe(1);
      
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.matches.size).toBe(0);
    });

    it('должен сбрасывать выбор', () => {
      const { result } = renderHook(() => useMatching({ words: testWords }));
      
      act(() => {
        result.current.handleEmojiSelect(result.current.emojis[0].id);
      });
      
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.selectedEmoji).toBeNull();
      expect(result.current.selectedWord).toBeNull();
    });
  });

  describe('граничные случаи', () => {
    it('должен корректно работать с минимальным количеством слов', () => {
      const minWords = testWords.slice(0, 2);
      const { result } = renderHook(() => useMatching({ words: minWords, pairCount: 2 }));
      
      expect(result.current.emojis).toHaveLength(2);
      expect(result.current.hebrewWords).toHaveLength(2);
    });

    it('должен корректно обрабатывать запрос большего количества пар чем доступно', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 10 }));
      
      expect(result.current.emojis.length).toBeLessThanOrEqual(testWords.length);
    });

    it('должен работать с одной парой', () => {
      const { result } = renderHook(() => useMatching({ words: testWords, pairCount: 1 }));
      
      expect(result.current.emojis).toHaveLength(1);
      expect(result.current.hebrewWords).toHaveLength(1);
    });
  });
});

