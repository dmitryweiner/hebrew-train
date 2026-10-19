// Верно или нет: 60 секунд, картинка и слово — подходит ли слово к картинке

import { useEffect, useRef, useState } from 'react';
import type { Word } from '../types';
import { WORDS, WORD_BY_ID } from '../data/dictionary';
import { generateWordDistractors } from '../utils/gameUtils';
import type { WordResult } from '../core/progress';
import WordImage from '../components/WordImage';
import HebrewText from '../components/HebrewText';
import type { TaskProps } from './types';

export const SPEED_DURATION = 60;

interface Card {
  word: Word;
  shown: Word;     // показанное слово: то же или похожее из той же категории
}

const makeCard = (word: Word): Card => ({
  word,
  shown: Math.random() < 0.5 ? word : generateWordDistractors(word, WORDS, 1)[0] ?? word,
});

const SpeedTask = ({ task, onDone }: TaskProps) => {
  const pool = task.wordIds.map(id => WORD_BY_ID[id]);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SPEED_DURATION);
  const [index, setIndex] = useState(0);
  const [card, setCard] = useState(() => makeCard(pool[0]));
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const results = useRef<WordResult[]>([]);
  const finished = started && timeLeft <= 0;

  useEffect(() => {
    if (!started || finished) return;
    const timer = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [started, finished, timeLeft]);

  const answer = (saysMatch: boolean) => {
    if (finished || flash) return;
    const correct = saysMatch === (card.shown.id === card.word.id);
    results.current.push({ wordId: card.word.id, correct });
    setStreak(s => (correct ? s + 1 : 0));
    setFlash(correct ? 'ok' : 'bad');
    // После ошибки чуть дольше показываем правильное слово
    window.setTimeout(() => {
      setFlash(null);
      const next = index + 1;
      setIndex(next);
      setCard(makeCard(pool[next % pool.length]));
    }, correct ? 250 : 1200);
  };

  const score = results.current.filter(r => r.correct).length;

  if (!started) {
    return (
      <div className="task">
        <div className="speed-intro">
          <div className="display-4">⚡</div>
          <p className="lead">
            Появится картинка и слово. Если слово подходит к картинке — нажмите <strong>«Верно»</strong>, если нет — <strong>«Неверно»</strong>.
          </p>
          <p>У вас {SPEED_DURATION} секунд. Попробуйте побить свой рекорд!</p>
        </div>
        <button className="btn btn-success btn-lg w-100" onClick={() => setStarted(true)}>
          ▶ Начать
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="task">
        <div className="answer-feedback is-correct">
          <div className="answer-feedback-title">⏱ Время вышло! Очков: {score}</div>
          <button className="btn btn-success btn-lg w-100 mt-2" onClick={() => onDone(results.current)}>
            Итоги →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task">
      <div className="speed-bar">
        <span className={timeLeft <= 10 ? 'text-danger' : ''}>⏱ {timeLeft} с</span>
        <span>Очки: {score}</span>
        <span>{streak >= 3 ? `🔥 ${streak} подряд` : ' '}</span>
      </div>
      <div className={`speed-card ${flash ? `is-${flash}` : ''}`}>
        <WordImage emoji={card.word.emoji} picture={card.word.picture} alt="картинка" size="large" />
        <HebrewText size="xl">{card.shown.hebrew}</HebrewText>
        {flash === 'bad' && (
          <div className="speed-correction">
            {card.shown.id === card.word.id ? 'Это было верно: ' : 'На картинке: '}
            <HebrewText size="sm">{card.word.hebrew}</HebrewText> — {card.word.russian}
          </div>
        )}
      </div>
      <div className="d-flex gap-3 mt-3">
        <button className="btn btn-outline-danger btn-lg flex-fill speed-btn" onClick={() => answer(false)}>
          ✗ Неверно
        </button>
        <button className="btn btn-success btn-lg flex-fill speed-btn" onClick={() => answer(true)}>
          ✓ Верно
        </button>
      </div>
    </div>
  );
};

export default SpeedTask;
