// Игра 3: Слово (выбор) - выбор правильного слова для эмодзи

import { useState, useEffect } from 'react';
import type { Word } from '../../types';
import { useScore } from '../../hooks/useScore';
import { useAutoNext } from '../../hooks/useAutoNext';
import { getRandomWord } from '../../utils/wordUtils';
import { generateWordDistractors } from '../../utils/gameUtils';
import EmojiDisplay from '../EmojiDisplay';

interface Game3WordChoiceProps {
  words: Word[];
  onExit: () => void;
}

export const Game3WordChoice = ({ words, onExit }: Game3WordChoiceProps) => {
  const {
    currentCorrect,
    currentTotal,
    currentPercentage,
    addCorrect,
    addIncorrect,
    gameStats,
  } = useScore('word-choice');

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<Word[]>([]);
  const [selectedOption, setSelectedOption] = useState<Word | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Генерация нового раунда
  const generateNewRound = () => {
    const word = getRandomWord(words);
    if (!word) return;

    // Генерируем 2-3 дистрактора
    const distractorCount = Math.floor(Math.random() * 2) + 2; // 2-3 дистракторов
    const distractors = generateWordDistractors(word, words, distractorCount);
    
    // Создаем массив вариантов и перемешиваем
    const allOptions = [word, ...distractors].sort(() => Math.random() - 0.5);

    setCurrentWord(word);
    setOptions(allOptions);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowFeedback(false);
  };

  // Хук для автоматического перехода к следующему раунду
  const { scheduleNext, goNext } = useAutoNext(generateNewRound);

  // Инициализация первого раунда
  useEffect(() => {
    if (words.length > 0) {
      generateNewRound();
    }
  }, [words]);

  // Обработка выбора варианта
  const handleOptionClick = (option: Word) => {
    if (selectedOption !== null) return; // Уже выбрано

    setSelectedOption(option);
    const correct = option.id === currentWord?.id;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      addCorrect();
      // Автоматический переход к следующему слову через 4 секунды
      scheduleNext(4000);
    } else {
      addIncorrect();
      // При ошибке даем возможность попробовать снова через 2.5 секунды
      setTimeout(() => {
        setSelectedOption(null);
        setShowFeedback(false);
        setIsCorrect(null);
      }, 2500);
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
          <h5 className="mb-0">Игра 3: Слово (выбор)</h5>
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
          <EmojiDisplay emoji={currentWord.emoji} size="large" />

          {/* Инструкция */}
          <p className="text-muted mt-4 mb-4">
            Выберите правильное слово для этого эмодзи
          </p>

          {/* Варианты ответов */}
          <div className="row g-3 justify-content-center">
            {options.map((option) => {
              let btnClass = 'btn btn-outline-primary btn-lg w-100';
              
              if (selectedOption?.id === option.id) {
                if (isCorrect === true) {
                  btnClass = 'btn btn-success btn-lg w-100';
                } else if (isCorrect === false) {
                  btnClass = 'btn btn-danger btn-lg w-100';
                }
              } else if (showFeedback && option.id === currentWord.id) {
                // Показываем правильный ответ при ошибке
                btnClass = 'btn btn-outline-success btn-lg w-100';
              }

              return (
                <div key={option.id} className="col-12 col-md-6">
                  <button
                    onClick={() => handleOptionClick(option)}
                    disabled={selectedOption !== null}
                    className={btnClass}
                    style={{
                      minHeight: '70px',
                      fontSize: '28px',
                      fontFamily: 'Arial, sans-serif',
                      direction: 'rtl',
                    }}
                  >
                    {option.hebrew}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Обратная связь */}
          {showFeedback && (
            <div className="mt-4">
              {isCorrect ? (
                <div>
                  <div className="alert alert-success mb-3" role="alert">
                    <strong>✓ Правильно!</strong>
                    <div className="small mt-1">
                      {currentWord.emoji} {currentWord.hebrew} = {currentWord.russian}
                    </div>
                    <div className="small text-muted">
                      ({currentWord.transliteration})
                    </div>
                  </div>
                  <button
                    onClick={goNext}
                    className="btn btn-primary btn-lg"
                  >
                    Дальше! →
                  </button>
                </div>
              ) : (
                <div className="alert alert-danger mb-0" role="alert">
                  <strong>✗ Неправильно</strong>
                  <div className="small mt-2">
                    Правильный ответ: <span className="fs-5 fw-bold">{currentWord.hebrew}</span>
                  </div>
                  <div className="small mt-1">Попробуйте ещё раз</div>
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
    </div>
  );
};

