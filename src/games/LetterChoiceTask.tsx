// Угадай букву: слово с пропуском → одна из четырёх букв

import { useState } from 'react';
import { WORD_BY_ID } from '../data/dictionary';
import { getRandomPosition } from '../utils/hebrewUtils';
import { generateLetterOptions } from '../utils/gameUtils';
import WordImage from '../components/WordImage';
import HebrewText from '../components/HebrewText';
import AnswerFeedback from '../components/game/AnswerFeedback';
import type { TaskProps } from './types';

const LetterChoiceTask = ({ task, onDone }: TaskProps) => {
  const word = WORD_BY_ID[task.wordIds[0]];
  const letters = Array.from(word.hebrew);
  const [position] = useState(() => getRandomPosition(word.hebrew));
  const correctLetter = letters[position];
  const [options] = useState(() => generateLetterOptions(correctLetter, word.hebrew, 4));
  const [selected, setSelected] = useState<string | null>(null);
  const correct = selected === correctLetter;

  return (
    <div className="task">
      <p className="task-prompt">Какой буквы не хватает?</p>
      <WordImage emoji={word.emoji} picture={word.picture} alt={word.russian} size="large" />
      <div className="task-translation">{word.russian}</div>
      <div className="gapped-word" dir="rtl" lang="he">
        {letters.map((letter, i) =>
          i === position ? (
            <span key={i} className={`gap ${selected ? (correct ? 'is-correct' : 'is-wrong') : ''}`}>
              {selected ? correctLetter : '?'}
            </span>
          ) : (
            <span key={i} className={letter === ' ' ? 'gap-space' : ''}>{letter}</span>
          )
        )}
      </div>
      <div className="options-grid options-grid-letters">
        {options.map(option => {
          let state = '';
          if (selected) {
            if (option === correctLetter) state = 'is-correct';
            else if (option === selected) state = 'is-wrong';
            else state = 'is-dimmed';
          }
          return (
            <button key={option} className={`option-btn ${state}`} disabled={selected !== null} onClick={() => setSelected(option)}>
              <HebrewText size="lg">{option}</HebrewText>
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

export default LetterChoiceTask;
