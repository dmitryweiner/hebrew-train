// Угадай слово: картинка → одно из четырёх слов

import { useState } from 'react';
import { WORDS, WORD_BY_ID } from '../data/dictionary';
import { generateWordDistractors } from '../utils/gameUtils';
import { shuffleArray } from '../utils/wordUtils';
import WordImage from '../components/WordImage';
import HebrewText from '../components/HebrewText';
import AnswerFeedback from '../components/game/AnswerFeedback';
import type { TaskProps } from './types';

const WordChoiceTask = ({ task, onDone }: TaskProps) => {
  const word = WORD_BY_ID[task.wordIds[0]];
  const [options] = useState(() => shuffleArray([word, ...generateWordDistractors(word, WORDS, 3)]));
  const [selected, setSelected] = useState<string | null>(null);
  const correct = selected === word.id;

  return (
    <div className="task">
      <p className="task-prompt">Что на картинке?</p>
      <WordImage emoji={word.emoji} picture={word.picture} alt="загаданное слово" size="large" />
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
              className={`option-btn ${state}`}
              disabled={selected !== null}
              onClick={() => setSelected(option.id)}
            >
              <HebrewText size="md">{option.hebrew}</HebrewText>
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

export default WordChoiceTask;
