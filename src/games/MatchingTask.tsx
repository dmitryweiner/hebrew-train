// Найди пары: слева картинки, справа слова. Ошибка только мигает и отмечает слово как трудное.

import { useState } from 'react';
import { WORD_BY_ID } from '../data/dictionary';
import { shuffleArray } from '../utils/wordUtils';
import WordImage from '../components/WordImage';
import HebrewText from '../components/HebrewText';
import { useAnswerSound } from '../hooks/useAnswerSound';
import type { TaskProps } from './types';

type Side = 'pic' | 'word';
interface Selection {
  side: Side;
  id: string;
}

const MatchingTask = ({ task, onDone }: TaskProps) => {
  const [pics] = useState(() => shuffleArray(task.wordIds));
  const [hebrew] = useState(() => shuffleArray(task.wordIds));
  const [selected, setSelected] = useState<Selection | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [flash, setFlash] = useState<Selection[]>([]);
  const finished = matched.length === task.wordIds.length;
  const playSound = useAnswerSound();

  const tap = (side: Side, id: string) => {
    if (matched.includes(id) || finished) return;
    if (!selected || selected.side === side) {
      setSelected({ side, id });
      return;
    }
    playSound(selected.id === id);
    if (selected.id === id) {
      setMatched(m => [...m, id]);
    } else {
      // Не знал слово тот, кто начал пару: картинку → не вспомнил слово, слово → не узнал картинку
      setMistakes(m => (m.includes(selected.id) ? m : [...m, selected.id]));
      setFlash([selected, { side, id }]);
      setTimeout(() => setFlash([]), 600);
    }
    setSelected(null);
  };

  const stateOf = (side: Side, id: string) => {
    if (matched.includes(id)) return 'is-matched';
    if (flash.some(f => f.side === side && f.id === id)) return 'is-wrong';
    if (selected?.side === side && selected.id === id) return 'is-selected';
    return '';
  };

  // Номер найденной пары на обеих половинках, чтобы было видно, что с чем соединилось
  const badge = (id: string) =>
    matched.includes(id) ? <span className="match-badge">{matched.indexOf(id) + 1}</span> : null;

  return (
    <div className="task">
      <p className="task-prompt">Нажмите на картинку, затем на её слово</p>
      <div className="matching">
        <div className="matching-col">
          {pics.map(id => {
            const word = WORD_BY_ID[id];
            return (
              <button key={id} className={`match-item ${stateOf('pic', id)}`} onClick={() => tap('pic', id)} aria-label={word.russian}>
                <WordImage emoji={word.emoji} picture={word.picture} alt={word.russian} size="small" />
                {badge(id)}
              </button>
            );
          })}
        </div>
        <div className="matching-col">
          {hebrew.map(id => (
            <button key={id} className={`match-item ${stateOf('word', id)}`} onClick={() => tap('word', id)}>
              <HebrewText size="sm">{WORD_BY_ID[id].hebrew}</HebrewText>
              {badge(id)}
            </button>
          ))}
        </div>
      </div>
      {finished && (
        <div className="answer-feedback is-correct">
          <div className="answer-feedback-title">
            {mistakes.length === 0 ? '✓ Все пары без ошибок!' : '✓ Все пары найдены'}
          </div>
          <button
            className="btn btn-success btn-lg w-100 mt-2"
            onClick={() => onDone(task.wordIds.map(id => ({ wordId: id, correct: !mistakes.includes(id) })))}
          >
            Дальше →
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchingTask;
