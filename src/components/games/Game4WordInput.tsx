// Игра 4: Слово (ввод) - написание слова целиком с клавиатуры

import { useState, useEffect } from 'react';
import * as React from 'react';
import type { Word } from '../../types';
import { useScore } from '../../hooks/useScore';
import { useHebrewInput } from '../../hooks/useHebrewInput';
import { useAutoNext } from '../../hooks/useAutoNext';
import { getRandomWord } from '../../utils/wordUtils';
import { normalizeFinalLetters } from '../../utils/hebrewUtils';
import WordImage from '../WordImage';
import SuccessModal from '../SuccessModal';

interface Game4WordInputProps {
  words: Word[];
  onExit: () => void;
}

export const Game4WordInput = ({ words, onExit }: Game4WordInputProps) => {
  const {
    currentCorrect,
    currentTotal,
    currentPercentage,
    addCorrect,
    addIncorrect,
    gameStats,
  } = useScore('word-input');

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const { value: userInput, setValue: setUserInput, showWarning } = useHebrewInput({ maxLength: 20 });
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Генерация нового раунда
  const generateNewRound = () => {
    const word = getRandomWord(words);
    if (!word) return;

    setCurrentWord(word);
    setUserInput('');
    setAttempts(0);
    setIsCorrect(null);
    setShowFeedback(false);
    setShowHint(false);

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
    if (!userInput.trim() || !currentWord) return;

    // Нормализуем слова для сравнения (обрабатываем конечные формы)
    const normalizedInput = normalizeFinalLetters(userInput.trim());
    const normalizedCorrect = normalizeFinalLetters(currentWord.hebrew);
    
    const correct = normalizedInput === normalizedCorrect;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      addCorrect();
      // Автоматический переход к следующему слову через 4.5 секунды
      scheduleNext(4500);
    } else {
      addIncorrect();
      setAttempts(prev => prev + 1);

      // Если израсходованы все попытки (3), показываем правильный ответ и переходим дальше
      if (attempts >= 2) {
        setTimeout(() => {
          generateNewRound();
        }, 4500);
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

  // Показать подсказку (первая буква)
  const handleShowHint = () => {
    if (currentWord && !showHint && attempts < 2) {
      setShowHint(true);
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
          <h5 className="mb-0">Игра 4: Слово (ввод)</h5>
          <div className="text-muted small">⭐⭐⭐ Продвинутый уровень</div>
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

          {/* Инструкция */}
          <p className="text-muted mt-4 mb-2">
            Напишите слово на иврите
          </p>

          {/* Индикатор длины слова */}
          <div className="mb-3">
            <span className="badge bg-secondary">
              {currentWord.hebrew.length} {currentWord.hebrew.length === 1 ? 'буква' : 
               currentWord.hebrew.length < 5 ? 'буквы' : 'букв'}
            </span>
          </div>

          {/* Индикатор попыток */}
          {attempts > 0 && !isCorrect && (
            <div className="alert alert-warning py-2 mb-3">
              Попытка {attempts + 1} из 3
            </div>
          )}

          {/* Подсказка */}
          {showHint && !showFeedback && (
            <div className="alert alert-info py-2 mb-3">
              <strong>💡 Подсказка:</strong> Первая буква — {currentWord.hebrew[0]}
            </div>
          )}

          {/* Поле ввода */}
          <div className="row justify-content-center mb-3">
            <div className="col-12 col-md-8">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={showFeedback}
                className="form-control form-control-lg text-center"
                placeholder="Напишите слово..."
                dir="rtl"
                lang="he"
                inputMode="text"
                style={{
                  fontSize: '32px',
                  height: '70px',
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

          {/* Кнопки действий */}
          <div className="d-flex gap-2 justify-content-center">
            <button
              onClick={handleCheck}
              disabled={!userInput.trim() || showFeedback}
              className="btn btn-primary btn-lg px-5"
            >
              Проверить
            </button>
            
            {!showHint && !showFeedback && attempts > 0 && attempts < 2 && (
              <button
                onClick={handleShowHint}
                className="btn btn-outline-info btn-lg"
              >
                💡 Подсказка
              </button>
            )}
          </div>

          {/* Обратная связь для ошибок */}
          {showFeedback && !isCorrect && (
            <div className="mt-4">
              {attempts >= 2 ? (
                <div className="alert alert-danger mb-0" role="alert">
                  <strong>✗ Неправильно</strong>
                  <div className="small mt-2">
                    Правильное слово: <span className="fs-4 fw-bold">{currentWord.hebrew}</span>
                  </div>
                  <div className="small mt-1">
                    {currentWord.russian} ({currentWord.transliteration})
                  </div>
                  {userInput && (
                    <div className="small mt-2 text-muted">
                      Вы написали: {userInput}
                    </div>
                  )}
                </div>
              ) : (
                <div className="alert alert-danger mb-0" role="alert">
                  <strong>✗ Неправильно</strong>
                  <div className="small mt-1">Попробуйте ещё раз</div>
                  {userInput && (
                    <div className="small mt-2 text-muted">
                      Вы написали: {userInput}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Категория внизу */}
      <div className="text-center mt-3 text-muted small">
        Категория: {currentWord.category} • Уровень: {'⭐'.repeat(currentWord.difficulty)}
      </div>

      {/* Модальное окно успеха */}
      <SuccessModal 
        show={isCorrect === true && showFeedback}
        word={currentWord}
        onNext={goNext}
      />
    </div>
  );
};

