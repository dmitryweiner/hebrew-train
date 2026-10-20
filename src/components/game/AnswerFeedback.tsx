// Короткая карточка после ответа: правильно/неправильно, слово и перевод

import { useEffect, useRef, useState } from 'react';
import type { Word } from '../../types';
import { useSettings } from '../../state/progressContext';
import { useAnswerSound } from '../../hooks/useAnswerSound';
import HebrewText from '../HebrewText';
import WordImage from '../WordImage';
import SpeakButton from '../SpeakButton';

interface AnswerFeedbackProps {
  word: Word;
  correct: boolean;
  onNext: () => void;
  /** Текст вместо «Правильно!» / «Неправильно» */
  message?: string;
}

const AnswerFeedback = ({ word, correct, onNext, message }: AnswerFeedbackProps) => {
  const { autoNext, feedbackDelay } = useSettings();
  const playSound = useAnswerSound();
  // Пока слово звучит, автопереход ждёт, иначе карточка исчезнет посреди слова
  const [speaking, setSpeaking] = useState(false);
  const next = useRef(onNext);
  next.current = onNext;
  // Нажатие «Дальше» и таймер не должны засчитать переход дважды
  const done = useRef(false);
  const goNext = () => {
    if (done.current) return;
    done.current = true;
    next.current();
  };

  useEffect(() => {
    playSound(correct);
    // Звук — только в момент ответа
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // После ошибки ждём «Дальше»: нужно время рассмотреть ответ и подсказку
    if (!correct || !autoNext || speaking) return;
    const timer = window.setTimeout(goNext, feedbackDelay * 1000);
    return () => window.clearTimeout(timer);
  }, [correct, autoNext, speaking, feedbackDelay]);

  return (
    <>
      {correct && <div className="tap-catcher" onClick={goNext} aria-hidden />}
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
          <SpeakButton
            text={word.hebrew}
            compact
            onSpeak={() => setSpeaking(true)}
            onEnd={() => setSpeaking(false)}
          />
        </div>
        {!correct && word.mnemonic && <div className="mnemonic mb-3">💡 {word.mnemonic}</div>}
        <button className={`btn btn-lg w-100 ${correct ? 'btn-success' : 'btn-primary'}`} onClick={goNext}>
          Дальше →
        </button>
      </div>
    </>
  );
};

export default AnswerFeedback;
