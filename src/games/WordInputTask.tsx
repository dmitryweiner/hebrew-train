// Напиши слово: ввод слова целиком, до трёх попыток с подсказками

import { useRef, useState } from 'react';
import { WORD_BY_ID } from '../data/dictionary';
import { compareHebrewWords, countHebrewLetters, getRandomPosition, isHebrewText, normalizeGeresh } from '../utils/hebrewUtils';
import WordImage from '../components/WordImage';
import HebrewText from '../components/HebrewText';
import AnswerFeedback from '../components/game/AnswerFeedback';
import { pluralRu } from '../utils/plural';
import type { TaskProps } from './types';

const MAX_ATTEMPTS = 3;


const WordInputTask = ({ task, onDone }: TaskProps) => {
  const word = WORD_BY_ID[task.wordIds[0]];
  const [value, setValue] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState<boolean | null>(null);   // null — ещё отвечаем
  const [hiddenPosition] = useState(() => getRandomPosition(word.hebrew));
  const inputRef = useRef<HTMLInputElement>(null);
  const letterCount = countHebrewLetters(word.hebrew);
  const wrongLayout = value !== '' && !isHebrewText(value);

  const check = () => {
    if (!value.trim() || finished !== null) return;
    if (compareHebrewWords(value, word.hebrew)) {
      setFinished(true);
      return;
    }
    const next = attempts + 1;
    setAttempts(next);
    setValue('');
    if (next >= MAX_ATTEMPTS) setFinished(false);
    else inputRef.current?.focus();
  };

  // Задание засчитано, только если слово написано с первой попытки
  const correct = finished === true && attempts === 0;

  return (
    <div className="task">
      <p className="task-prompt">Напишите слово на иврите</p>
      <WordImage emoji={word.emoji} picture={word.picture} alt={word.russian} size="large" />
      <div className="task-translation">{word.russian}</div>
      <div className="text-muted mb-2">
        {letterCount} {pluralRu(letterCount, 'буква', 'буквы', 'букв')}
      </div>

      {attempts === 1 && finished === null && (
        <div className="hint">💡 Первая буква: <HebrewText size="md">{word.hebrew[0]}</HebrewText></div>
      )}
      {attempts === 2 && finished === null && (
        <div className="hint">
          💡 Почти всё слово: <HebrewText size="md">
            {Array.from(word.hebrew).map((c, i) => (i === hiddenPosition ? '_' : c)).join('')}
          </HebrewText>
        </div>
      )}

      {finished === null && (
        <>
          <input
            ref={inputRef}
            className="form-control form-control-lg text-center word-input"
            value={value}
            onChange={e => setValue(normalizeGeresh(e.target.value).slice(0, 20))}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="Напишите здесь"
            dir="rtl"
            lang="he"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
          />
          {wrongLayout && <div className="alert alert-warning py-2 mt-2 mb-0">⚠️ Переключите клавиатуру на иврит</div>}
          {attempts > 0 && (
            <div className="text-danger mt-2">✗ Не так. Попытка {attempts + 1} из {MAX_ATTEMPTS}</div>
          )}
          <button className="btn btn-success btn-lg w-100 mt-3" disabled={!value.trim()} onClick={check}>
            Проверить
          </button>
        </>
      )}

      {finished !== null && (
        <AnswerFeedback
          word={word}
          correct={correct}
          message={finished && !correct ? '✓ Верно, но не с первой попытки' : undefined}
          onNext={() => onDone([{ wordId: word.id, correct }])}
        />
      )}
    </div>
  );
};

export default WordInputTask;
