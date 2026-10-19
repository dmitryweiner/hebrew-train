// Экран итогов раунда

import type { RoundKind } from '../../types';
import type { RoundSummary as Summary } from '../../core/round';
import { BOX_LABELS, calcStars, type Box } from '../../core/progress';
import { WORD_BY_ID } from '../../data/dictionary';
import WordImage from '../WordImage';
import HebrewText from '../HebrewText';

interface RoundSummaryProps {
  kind: RoundKind;
  summary: Summary;
  boxes: Record<string, Box>;
  record?: number;          // рекорд для «Верно/Неверно»
  onRepeatMistakes: () => void;
  onAgain: () => void;
  onMenu: () => void;
}

const Stars = ({ count }: { count: number }) => (
  <div className="summary-stars" aria-label={`${count} из 3 звёзд`}>
    {[1, 2, 3].map(i => (
      <span key={i} className={i <= count ? 'star is-on' : 'star'}>★</span>
    ))}
  </div>
);

const RoundSummary = ({ kind, summary, boxes, record, onRepeatMistakes, onAgain, onMenu }: RoundSummaryProps) => {
  const isSpeed = kind === 'speed';
  const stars = calcStars(summary.correct, summary.total);
  const headline = isSpeed
    ? summary.correct >= (record ?? 0) && summary.correct > 0 ? 'Новый рекорд!' : 'Время вышло'
    : stars === 3 ? 'Отлично!' : stars === 2 ? 'Хорошо!' : 'Раунд пройден';

  return (
    <div className="round-summary">
      <h1 className="h2 text-center mb-2">{headline}</h1>
      {!isSpeed && <Stars count={stars} />}
      <div className="summary-score">
        {isSpeed ? (
          <>
            Очков: <strong>{summary.correct}</strong>
            {record !== undefined && <div className="small text-muted">Рекорд: {Math.max(record, summary.correct)}</div>}
          </>
        ) : (
          <>Правильно <strong>{summary.correct}</strong> из {summary.total}</>
        )}
      </div>

      <div className="summary-actions">
        {summary.mistakes.length > 0 && (
          <button className="btn btn-warning btn-lg" onClick={onRepeatMistakes}>
            🔁 Повторить ошибки ({summary.mistakes.length})
          </button>
        )}
        <button className="btn btn-success btn-lg" onClick={onAgain}>
          ▶ Ещё раунд
        </button>
        <button className="btn btn-outline-secondary btn-lg" onClick={onMenu}>
          ☰ В меню
        </button>
      </div>

      {summary.words.length > 0 && (
        <ul className="summary-words">
          {summary.words.map(({ wordId, correct, boxUp }) => {
            const word = WORD_BY_ID[wordId];
            if (!word) return null;
            return (
              <li key={wordId} className={correct ? 'is-correct' : 'is-wrong'}>
                <span className="summary-mark" aria-label={correct ? 'правильно' : 'ошибка'}>{correct ? '✓' : '✗'}</span>
                <WordImage emoji={word.emoji} picture={word.picture} alt={word.russian} size="small" />
                <span className="summary-word">
                  <HebrewText size="sm">{word.hebrew}</HebrewText>
                  <span className="text-muted small">{word.russian}</span>
                </span>
                {boxUp && <span className="summary-up" title="Слово выучено лучше">↑ {BOX_LABELS[boxes[wordId] ?? 1]}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RoundSummary;
