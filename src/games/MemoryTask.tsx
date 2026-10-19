// Мемори: карточки рубашкой вверх, пара — картинка и её слово

import { useEffect, useState } from 'react';
import { WORD_BY_ID } from '../data/dictionary';
import { shuffleArray } from '../utils/wordUtils';
import WordImage from '../components/WordImage';
import HebrewText from '../components/HebrewText';
import { pluralRu } from '../utils/plural';
import type { TaskProps } from './types';

interface Card {
  key: string;
  wordId: string;
  kind: 'pic' | 'word';
}

const FLIP_BACK_DELAY = 1100;

const MemoryTask = ({ task, onDone }: TaskProps) => {
  const [cards] = useState<Card[]>(() =>
    shuffleArray(task.wordIds.flatMap(wordId => [
      { key: `${wordId}-pic`, wordId, kind: 'pic' as const },
      { key: `${wordId}-word`, wordId, kind: 'word' as const },
    ]))
  );
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const finished = matched.length === task.wordIds.length;

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map(key => cards.find(c => c.key === key)!);
    if (a.wordId === b.wordId) {
      setMatched(m => [...m, a.wordId]);
      setOpen([]);
      return;
    }
    const timer = window.setTimeout(() => setOpen([]), FLIP_BACK_DELAY);
    return () => window.clearTimeout(timer);
  }, [open, cards]);

  const flip = (card: Card) => {
    if (open.length >= 2 || open.includes(card.key) || matched.includes(card.wordId)) return;
    if (open.length === 1) setMoves(m => m + 1);
    setOpen(o => [...o, card.key]);
  };

  return (
    <div className="task">
      <p className="task-prompt">Откройте по две карточки и найдите пары</p>
      <div className="memory-grid">
        {cards.map(card => {
          const word = WORD_BY_ID[card.wordId];
          const faceUp = open.includes(card.key) || matched.includes(card.wordId);
          return (
            <button
              key={card.key}
              className={`memory-card ${faceUp ? 'is-open' : ''} ${matched.includes(card.wordId) ? 'is-matched' : ''}`}
              onClick={() => flip(card)}
              aria-label={faceUp ? (card.kind === 'pic' ? word.russian : word.hebrew) : 'закрытая карточка'}
            >
              {!faceUp ? (
                <span className="memory-back" aria-hidden>?</span>
              ) : card.kind === 'pic' ? (
                <WordImage emoji={word.emoji} picture={word.picture} alt={word.russian} size="small" />
              ) : (
                <HebrewText size="sm">{word.hebrew}</HebrewText>
              )}
            </button>
          );
        })}
      </div>
      <div className="text-muted">Ходов: {moves}</div>
      {finished && (
        <div className="answer-feedback is-correct">
          <div className="answer-feedback-title">✓ Все пары найдены за {moves} {pluralRu(moves, 'ход', 'хода', 'ходов')}</div>
          <button
            className="btn btn-success btn-lg w-100 mt-2"
            onClick={() => onDone(task.wordIds.map(wordId => ({ wordId, correct: true })))}
          >
            Дальше →
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryTask;
