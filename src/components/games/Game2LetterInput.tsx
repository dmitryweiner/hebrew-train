// Игра 2: Буква (ввод) - ввод пропущенной буквы с клавиатуры

import { useState, useEffect } from 'react';
import * as React from 'react';
import type { Word } from '../../types';
import { useScore } from '../../hooks/useScore';
import { useHebrewInput } from '../../hooks/useHebrewInput';
import { useAutoNext } from '../../hooks/useAutoNext';
import { getRandomWord } from '../../utils/wordUtils';
import { getRandomPosition, hideLetterAtPosition, normalizeFinalLetters } from '../../utils/hebrewUtils';
import WordImage from '../WordImage';

interface Game2LetterInputProps {
  words: Word[];
  onExit: () => void;
}

export const Game2LetterInput = ({ words, onExit }: Game2LetterInputProps) => {
  const {
    currentCorrect,
    currentTotal,
    currentPercentage,
    addCorrect,
    addIncorrect,
    gameStats,
  } = useScore('letter-input');

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [displayWord, setDisplayWord] = useState('');
  const [correctLetter, setCorrectLetter] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const { value: userInput, setValue: setUserInput, showWarning } = useHebrewInput({ maxLength: 1 });
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Генерация нового раунда
  const generateNewRound = () => {
    const word = getRandomWord(words);
    if (!word) return;

    const position = getRandomPosition(word.hebrew);
    const { displayWord: hiddenWord, hiddenLetter } = hideLetterAtPosition(word.hebrew, position);

    setCurrentWord(word);
    setDisplayWord(hiddenWord);
    setCorrectLetter(hiddenLetter);
    setUserInput('');
    setAttempts(0);
    setIsCorrect(null);
    setShowFeedback(false);

    // Автофокус на поле ввода
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Хук для автоматического перехода к следующему раунду
  const { scheduleNext, goNext } = useAutoNext(generateNewRound);

  // Инициализация первого раунда
  useEffect(() => {
    if (words.length > 0) {
      generateNewRound();
    }
  }, [words]);

  // Проверка ответа
  const handleCheck = () => {
    if (!userInput.trim()) return;

    // Нормализуем буквы для сравнения (обрабатываем конечные формы)
    const normalizedInput = normalizeFinalLetters(userInput.trim());
    const normalizedCorrect = normalizeFinalLetters(correctLetter);
    
    const correct = normalizedInput === normalizedCorrect;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      addCorrect();
      // Автоматический переход к следующему слову через 4 секунды
      scheduleNext(4000);
    } else {
      addIncorrect();
      setAttempts(prev => prev + 1);

      // Если израсходованы все попытки (2), показываем правильный ответ и переходим дальше
      if (attempts >= 1) {
        setTimeout(() => {
          generateNewRound();
        }, 3500);
      } else {
        // Даем возможность попробовать снова
        setTimeout(() => {
          setUserInput('');
          setShowFeedback(false);
          setIsCorrect(null);
          inputRef.current?.focus();
        }, 2500);
      }
    }
  };

  // Обработка нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showFeedback) {
      handleCheck();
    }
  };

  if (!currentWord) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Заголовок со счётом */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button onClick={onExit} className="btn btn-outline-secondary">
          ← Назад
        </button>
        <div className="text-center">
          <h5 className="mb-0">Игра 2: Буква (ввод)</h5>
          <div className="text-muted small">⭐⭐ Средний уровень</div>
        </div>
        <div className="text-end">
          <div className="fw-bold">
            {currentCorrect} / {currentTotal}
          </div>
          <div className="text-muted small">{currentPercentage}%</div>
        </div>
      </div>

      {/* Статистика игры */}
      <div className="card mb-4">
        <div className="card-body p-3">
          <div className="row text-center">
            <div className="col-4">
              <div className="text-muted small">Всего</div>
              <div className="h5 mb-0">{gameStats.total}</div>
            </div>
            <div className="col-4">
              <div className="text-muted small">Правильно</div>
              <div className="h5 mb-0 text-success">{gameStats.correct}</div>
            </div>
            <div className="col-4">
              <div className="text-muted small">Процент</div>
              <div className="h5 mb-0">{gameStats.percentage}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Область игры */}
      <div className="card shadow-sm">
        <div className="card-body text-center p-4">
          {/* Эмодзи */}
          <WordImage emoji={currentWord.emoji} picture={currentWord.picture} alt={currentWord.russian} size="large" />

          {/* Слово с пропуском или полное слово при правильном ответе */}
          <div 
            className="display-4 my-4 fw-bold hebrew-text"
            style={{ 
              fontFamily: 'Arial, sans-serif',
              letterSpacing: '0.1em',
              direction: 'rtl',
            }}
          >
            {isCorrect ? currentWord.hebrew : displayWord}
          </div>

          {/* Инструкция */}
          <p className="text-muted mb-3">
            Введите пропущенную букву
          </p>

          {/* Индикатор попыток */}
          {attempts > 0 && !isCorrect && (
            <div className="alert alert-warning py-2 mb-3">
              Попытка {attempts + 1} из 2
            </div>
          )}

          {/* Поле ввода */}
          <div className="row justify-content-center mb-3">
            <div className="col-12 col-md-6">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={showFeedback}
                className="form-control form-control-lg text-center"
                placeholder="א"
                maxLength={1}
                dir="rtl"
                lang="he"
                inputMode="text"
                style={{
                  fontSize: '48px',
                  height: '80px',
                  fontFamily: 'Arial, sans-serif',
                }}
              />
            </div>
          </div>

          {/* Предупреждение о раскладке */}
          {showWarning && !showFeedback && (
            <div className="alert alert-warning py-2 mb-3">
              ⚠️ Переключите раскладку на иврит
            </div>
          )}

          {/* Кнопка проверки */}
          <button
            onClick={handleCheck}
            disabled={!userInput.trim() || showFeedback}
            className="btn btn-primary btn-lg px-5"
          >
            Проверить
          </button>

          {/* Обратная связь */}
          {showFeedback && (
            <div className="mt-4">
              {isCorrect ? (
                <div>
                  <div className="alert alert-success mb-3" role="alert">
                    <strong>✓ Правильно!</strong>
                    <div className="small mt-1">
                      {currentWord.hebrew} ({currentWord.russian})
                    </div>
                  </div>
                  <button
                    onClick={goNext}
                    className="btn btn-primary btn-lg"
                  >
                    Дальше! →
                  </button>
                </div>
              ) : attempts >= 1 ? (
                <div className="alert alert-danger mb-0" role="alert">
                  <strong>✗ Неправильно</strong>
                  <div className="small mt-2">
                    Правильная буква: <span className="fs-4 fw-bold">{correctLetter}</span>
                  </div>
                  <div className="small mt-1">
                    Полное слово: {currentWord.hebrew} ({currentWord.russian})
                  </div>
                </div>
              ) : (
                <div className="alert alert-danger mb-0" role="alert">
                  <strong>✗ Неправильно</strong>
                  <div className="small mt-1">Попробуйте ещё раз</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Подсказка внизу */}
      <div className="text-center mt-3 text-muted small">
        Подсказка: {currentWord.transliteration}
      </div>
    </div>
  );
};


