// Хук для игры на сопоставление пар (Игра 6)

import { useState, useCallback, useEffect } from 'react';
import type { Word, MatchingPair } from '../types';
import { shuffleArray, getRandomWord } from '../utils/wordUtils';

interface UseMatchingProps {
  words: Word[];
  pairCount?: number;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export const useMatching = ({ words, pairCount = 3, onCorrect, onIncorrect }: UseMatchingProps) => {
  const [emojis, setEmojis] = useState<MatchingPair[]>([]);
  const [hebrewWords, setHebrewWords] = useState<MatchingPair[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matches, setMatches] = useState<Map<string, string>>(new Map());
  const [incorrectPairs, setIncorrectPairs] = useState<Set<string>>(new Set());

  // Генерируем новый набор пар
  const generatePairs = useCallback(() => {
    const selectedWords: Word[] = [];
    const usedIds = new Set<string>();

    // Выбираем случайные уникальные слова
    while (selectedWords.length < pairCount && selectedWords.length < words.length) {
      const word = getRandomWord(words, Array.from(usedIds));
      if (word) {
        selectedWords.push(word);
        usedIds.add(word.id);
      }
    }

    // Создаём массивы для эмодзи и слов
    const emojiPairs: MatchingPair[] = selectedWords.map(word => ({
      id: word.id,
      emoji: word.emoji,
      word: word.hebrew,
      matched: false,
      selected: false,
    }));

    // Перемешиваем слова для правой колонки
    const wordPairs: MatchingPair[] = shuffleArray(selectedWords).map(word => ({
      id: word.id,
      emoji: word.emoji,
      word: word.hebrew,
      matched: false,
      selected: false,
    }));

    setEmojis(emojiPairs);
    setHebrewWords(wordPairs);
    setMatches(new Map());
    setSelectedEmoji(null);
    setSelectedWord(null);
    setIncorrectPairs(new Set());
  }, [words, pairCount]);

  // Инициализация при загрузке
  useEffect(() => {
    if (words.length > 0) {
      generatePairs();
    }
  }, [words, generatePairs]);

  // Обработка выбора эмодзи
  const handleEmojiSelect = useCallback((id: string) => {
    if (matches.has(id)) return; // Уже сопоставлено
    setSelectedEmoji(prevSelected => prevSelected === id ? null : id);
  }, [matches]);

  // Обработка выбора слова
  const handleWordSelect = useCallback((id: string) => {
    // Проверяем, не сопоставлено ли уже это слово
    const isAlreadyMatched = Array.from(matches.values()).includes(id);
    if (isAlreadyMatched) return;
    setSelectedWord(prevSelected => prevSelected === id ? null : id);
  }, [matches]);

  // Автоматическая проверка пары когда выбраны оба элемента
  useEffect(() => {
    if (selectedEmoji && selectedWord) {
      const isCorrect = selectedEmoji === selectedWord;

      if (isCorrect) {
        // Правильная пара
        setMatches(prev => new Map(prev).set(selectedEmoji, selectedWord));
        setEmojis(prev => prev.map(e => e.id === selectedEmoji ? { ...e, matched: true } : e));
        setHebrewWords(prev => prev.map(w => w.id === selectedWord ? { ...w, matched: true } : w));
        onCorrect?.();
      } else {
        // Неправильная пара
        const pairKey = `${selectedEmoji}-${selectedWord}`;
        setIncorrectPairs(prev => new Set(prev).add(pairKey));
        onIncorrect?.();
        
        // Убираем индикацию ошибки через 1 секунду
        setTimeout(() => {
          setIncorrectPairs(prev => {
            const newSet = new Set(prev);
            newSet.delete(pairKey);
            return newSet;
          });
        }, 1000);
      }

      // Сбрасываем выбор
      setSelectedEmoji(null);
      setSelectedWord(null);
    }
  }, [selectedEmoji, selectedWord, onCorrect, onIncorrect]);

  // Проверка, завершена ли игра
  const isComplete = matches.size === emojis.length && emojis.length > 0;

  // Сброс и новая игра
  const resetGame = useCallback(() => {
    generatePairs();
  }, [generatePairs]);

  return {
    emojis,
    hebrewWords,
    selectedEmoji,
    selectedWord,
    matches,
    incorrectPairs,
    isComplete,
    handleEmojiSelect,
    handleWordSelect,
    resetGame,
  };
};

