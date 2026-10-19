// Карточки: картинка → «Показать слово» → самооценка «Знал / Не знал».
// Новое слово показывается сразу: его нельзя «знать», с ним знакомятся.

import { useState } from 'react';
import { WORD_BY_ID } from '../data/dictionary';
import { useProgress } from '../state/progressContext';
import WordImage from '../components/WordImage';
import HebrewText from '../components/HebrewText';
import SpeakButton from '../components/SpeakButton';
import type { TaskProps } from './types';

const FlashcardTask = ({ task, onDone }: TaskProps) => {
  const word = WORD_BY_ID[task.wordIds[0]];
  const { progress } = useProgress();
  const [isNew] = useState(() => (progress.words[word.id]?.box ?? 0) === 0);
  const [revealed, setRevealed] = useState(isNew);
  const done = (correct: boolean) => onDone([{ wordId: word.id, correct }]);

  return (
    <div className="task flashcard">
      {isNew && <div className="badge-new">Новое слово</div>}
      <WordImage emoji={word.emoji} picture={word.picture} alt={word.russian} size="large" />
      <div className="task-translation">{word.russian}</div>

      {!revealed ? (
        <>
          <p className="task-prompt">Вспомните, как это на иврите</p>
          <button className="btn btn-primary btn-lg w-100" onClick={() => setRevealed(true)}>
            👁 Показать слово
          </button>
        </>
      ) : (
        <>
          <div className="flashcard-word">
            <HebrewText size="xl">{word.nikud ?? word.hebrew}</HebrewText>
            {word.nikud && <div className="text-muted small">без огласовок: <HebrewText size="sm">{word.hebrew}</HebrewText></div>}
            <div className="flashcard-translit">{word.transliteration}</div>
          </div>
          <SpeakButton text={word.hebrew} autoPlay />
          {word.mnemonic && <div className="mnemonic">💡 {word.mnemonic}</div>}
          {isNew ? (
            <button className="btn btn-success btn-lg w-100 mt-2" onClick={() => done(true)}>
              Запомнил →
            </button>
          ) : (
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-outline-danger btn-lg flex-fill" onClick={() => done(false)}>
                ✗ Не знал
              </button>
              <button className="btn btn-success btn-lg flex-fill" onClick={() => done(true)}>
                ✓ Знал
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlashcardTask;
