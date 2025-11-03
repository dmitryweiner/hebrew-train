// Игра 1: Буква (выбор) - выбор пропущенной буквы из вариантов

import { useState, useEffect } from 'react';
import type { Word } from '../../types';
import { useScore } from '../../hooks/useScore';
import { useAutoNext } from '../../hooks/useAutoNext';
import { getRandomWord } from '../../utils/wordUtils';
import { getRandomPosition, hideLetterAtPosition } from '../../utils/hebrewUtils';
import { generateLetterDistractors } from '../../utils/gameUtils';
import EmojiDisplay from '../EmojiDisplay';

interface Game1LetterChoiceProps {
  words: Word[];
  onExit: () => void;
}

export const Game1LetterChoice = ({ words, onExit }: Game1LetterChoiceProps) => {
  const {
    currentCorrect,
    currentTotal,
    currentPercentage,
    addCorrect,
    addIncorrect,
    gameStats,
  } = useScore('letter-choice');

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [displayWord, setDisplayWord] = useState('');
  const [correctLetter, setCorrectLetter] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Генерация нового раунда
  const generateNewRound = () => {
    const word = getRandomWord(words);
    if (!word) return;

    const position = getRandomPosition(word.hebrew);
    const { displayWord: hiddenWord, hiddenLetter } = hideLetterAtPosition(word.hebrew, position);
    
    // Генерируем варианты ответа (4-6 вариантов)
    const distractorCount = Math.floor(Math.random() * 3) + 3; // 3-5 дистракторов
    const distractors = generateLetterDistractors(hiddenLetter, word.hebrew, distractorCount);
    
    // Создаем массив вариантов без дубликатов и перемешиваем
    const optionsSet = new Set([hiddenLetter, ...distractors]);
    const allOptions = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    setCurrentWord(word);
    setDisplayWord(hiddenWord);
    setCorrectLetter(hiddenLetter);
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
  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return; // Уже выбрано

    setSelectedOption(option);
    const correct = option === correctLetter;
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
          <h5 className="mb-0">Игра 1: Буква (выбор)</h5>
          <div className="text-muted small">⭐ Начальный уровень</div>
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
          <p className="text-muted mb-4">
            Выберите пропущенную букву
          </p>

          {/* Варианты ответов */}
          <div className="row g-3 justify-content-center">
            {options.map((option, index) => {
              let btnClass = 'btn btn-outline-primary btn-lg w-100';
              
              if (selectedOption === option) {
                if (isCorrect === true) {
                  btnClass = 'btn btn-success btn-lg w-100';
                } else if (isCorrect === false) {
                  btnClass = 'btn btn-danger btn-lg w-100';
                }
              } else if (showFeedback && option === correctLetter) {
                // Показываем правильный ответ при ошибке
                btnClass = 'btn btn-outline-success btn-lg w-100';
              }

              return (
                <div key={index} className="col-6 col-md-3">
                  <button
                    onClick={() => handleOptionClick(option)}
                    disabled={selectedOption !== null}
                    className={btnClass}
                    style={{
                      minHeight: '60px',
                      fontSize: '32px',
                      fontFamily: 'Arial, sans-serif',
                    }}
                  >
                    {option}
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

