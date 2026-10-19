// Послушай и выбери: звучит слово, на экране четыре картинки

import { useEffect, useState } from 'react';
import { WORDS, WORD_BY_ID } from '../data/dictionary';
import { speak } from '../core/speech';
import { generateWordDistractors } from '../utils/gameUtils';
import { shuffleArray } from '../utils/wordUtils';
import WordImage from '../components/WordImage';
import AnswerFeedback from '../components/game/AnswerFeedback';
import type { TaskProps } from './types';

const ListenTask = ({ task, onDone }: TaskProps) => {
  const word = WORD_BY_ID[task.wordIds[0]];
  const [options] = useState(() => shuffleArray([word, ...generateWordDistractors(word, WORDS, 3)]));
  const [selected, setSelected] = useState<string | null>(null);
  const correct = selected === word.id;

  useEffect(() => {
    speak(word.hebrew);
  }, [word.hebrew]);

  return (
    <div className="task">
      <p className="task-prompt">Послушайте слово и выберите картинку</p>
      <button className="btn btn-primary btn-lg listen-btn" onClick={() => speak(word.hebrew)}>
        🔊 Послушать ещё раз
      </button>
      <div className="options-grid">
        {options.map(option => {
          let state = '';
          if (selected) {
            if (option.id === word.id) state = 'is-correct';
            else if (option.id === selected) state = 'is-wrong';
            else state = 'is-dimmed';
          }
          return (
            <button
              key={option.id}
              className={`option-btn option-picture ${state}`}
              disabled={selected !== null}
              onClick={() => setSelected(option.id)}
              aria-label={option.russian}
            >
              <WordImage emoji={option.emoji} picture={option.picture} alt={option.russian} />
            </button>
          );
        })}
      </div>
      {selected && (
        <AnswerFeedback word={word} correct={correct} onNext={() => onDone([{ wordId: word.id, correct }])} />
      )}
    </div>
  );
};

export default ListenTask;
