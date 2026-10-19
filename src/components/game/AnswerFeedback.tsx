// Короткая карточка после ответа: правильно/неправильно, слово и перевод

import { useEffect } from 'react';
import type { Word } from '../../types';
import { playAnswerSound } from '../../core/sounds';
import { useSettings } from '../../state/progressContext';
import HebrewText from '../HebrewText';
import WordImage from '../WordImage';
import SpeakButton from '../SpeakButton';

/** Сколько показывать правильный ответ перед автопереходом */
export const AUTO_NEXT_DELAY = 1500;

interface AnswerFeedbackProps {
  word: Word;
  correct: boolean;
  onNext: () => void;
  /** Текст вместо «Правильно!» / «Неправильно» */
  message?: string;
}

const AnswerFeedback = ({ word, correct, onNext, message }: AnswerFeedbackProps) => {
  const { sound } = useSettings();

  useEffect(() => {
    if (sound) playAnswerSound(correct);
    // Звук — только в момент ответа
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // После правильного ответа идём дальше сами; после ошибки ждём, пока человек рассмотрит ответ
    if (!correct) return;
    const timer = window.setTimeout(onNext, AUTO_NEXT_DELAY);
    return () => window.clearTimeout(timer);
  }, [correct, onNext]);

  return (
    <>
      {correct && <div className="tap-catcher" onClick={onNext} aria-hidden />}
      <div className={`answer-feedback ${correct ? 'is-correct' : 'is-wrong'}`} role="status">
        <div className="answer-feedback-title">
          {message ?? (correct ? '✓ Правильно!' : '✗ Неправильно')}
        </div>
        <div className="answer-feedback-word">
          <WordImage emoji={word.emoji} picture={word.picture} alt={word.russian} size="small" />
          <div>
            <HebrewText size="lg">{word.hebrew}</HebrewText>
            <div className="answer-feedback-translation">
              {word.russian} · <span className="text-muted">{word.transliteration}</span>
            </div>
          </div>
          <SpeakButton text={word.hebrew} compact />
        </div>
        {!correct && word.mnemonic && <div className="mnemonic mb-3">💡 {word.mnemonic}</div>}
        <button className={`btn btn-lg w-100 ${correct ? 'btn-success' : 'btn-primary'}`} onClick={onNext}>
          Дальше →
        </button>
      </div>
    </>
  );
};

export default AnswerFeedback;
