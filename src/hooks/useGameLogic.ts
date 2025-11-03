// Хук для общей логики игр

import { useState, useCallback, useEffect } from 'react';
import type { Word, GameType } from '../types';
import { getRandomWord, getRandomMissingPosition } from '../utils/wordUtils';
import { generateLetterOptions, generateWordOptions } from '../utils/gameUtils';

interface UseGameLogicProps {
  words: Word[];
  gameType: GameType;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export const useGameLogic = ({ words, gameType, onCorrectAnswer, onIncorrectAnswer }: UseGameLogicProps) => {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [missingPosition, setMissingPosition] = useState<number>(0);
  const [options, setOptions] = useState<string[] | Word[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // Генерируем новый вопрос
  const generateQuestion = useCallback(() => {
    const word = getRandomWord(words);
    if (!word) return;

    setCurrentWord(word);
    setUserAnswer('');
    setIsCorrect(null);
    setAttempts(0);
    setShowFeedback(false);

    // Генерируем опции в зависимости от типа игры
    if (gameType === 'letter-choice' || gameType === 'letter-input') {
      const position = getRandomMissingPosition(word.hebrew.length);
      setMissingPosition(position);
      
      if (gameType === 'letter-choice') {
        const correctLetter = Array.from(word.hebrew)[position];
        const letterOptions = generateLetterOptions(correctLetter, word.hebrew, 4);
        setOptions(letterOptions);
      }
    } else if (gameType === 'word-choice') {
      const wordOptions = generateWordOptions(word, words, 4);
      setOptions(wordOptions);
    }
  }, [words, gameType]);

  // Инициализация при загрузке или смене игры
  useEffect(() => {
    if (words.length > 0) {
      generateQuestion();
    }
  }, [words, gameType, generateQuestion]);

  // Проверка ответа
  const checkAnswer = useCallback((answer: string) => {
    if (!currentWord) return;

    setAttempts(prev => prev + 1);
    setShowFeedback(true);

    let correct = false;

    if (gameType === 'letter-choice' || gameType === 'letter-input') {
      const correctLetter = Array.from(currentWord.hebrew)[missingPosition];
      correct = answer === correctLetter;
    } else if (gameType === 'word-choice') {
      correct = answer === currentWord.id;
    } else if (gameType === 'word-input') {
      correct = answer === currentWord.hebrew;
    }

    setIsCorrect(correct);

    if (correct) {
      onCorrectAnswer?.();
      // Автоматически переходим к следующему вопросу через 1 секунду
      setTimeout(() => {
        generateQuestion();
      }, 1000);
    } else {
      onIncorrectAnswer?.();
    }
  }, [currentWord, gameType, missingPosition, onCorrectAnswer, onIncorrectAnswer, generateQuestion]);

  // Обработка выбора варианта (для игр с множественным выбором)
  const handleOptionSelect = useCallback((option: string) => {
    setUserAnswer(option);
    checkAnswer(option);
  }, [checkAnswer]);

  // Обработка ввода текста
  const handleTextInput = useCallback((value: string) => {
    setUserAnswer(value);
  }, []);

  // Отправка текстового ответа
  const submitAnswer = useCallback(() => {
    if (userAnswer.trim()) {
      checkAnswer(userAnswer.trim());
    }
  }, [userAnswer, checkAnswer]);

  // Переход к следующему вопросу
  const nextQuestion = useCallback(() => {
    generateQuestion();
  }, [generateQuestion]);

  // Повторить попытку (для игр с вводом)
  const retryQuestion = useCallback(() => {
    setUserAnswer('');
    setIsCorrect(null);
    setShowFeedback(false);
  }, []);

  return {
    // Состояние
    currentWord,
    missingPosition,
    options,
    userAnswer,
    isCorrect,
    attempts,
    showFeedback,

    // Методы
    handleOptionSelect,
    handleTextInput,
    submitAnswer,
    nextQuestion,
    retryQuestion,
    generateQuestion,
  };
};

