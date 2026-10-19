// Карточка слова: картинка, огласовки, озвучка, ассоциация и статус изучения

import type { Word } from '../types';
import { BOX_LABELS, type WordProgress } from '../core/progress';
import { parseDay } from '../core/dates';
import { getCategoryName } from '../data/categories';
import WordImage from './WordImage';
import HebrewText from './HebrewText';
import SpeakButton from './SpeakButton';

interface WordDialogProps {
  word: Word;
  progress?: WordProgress;
  onClose: () => void;
}

const formatDay = (day: string) => parseDay(day).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

const WordDialog = ({ word, progress, onClose }: WordDialogProps) => (
  <div className="dialog-backdrop" onClick={onClose}>
    <div className="dialog-card word-dialog" role="dialog" aria-modal="true" aria-label={word.russian} onClick={e => e.stopPropagation()}>
      <WordImage emoji={word.emoji} picture={word.picture} alt={word.russian} size="large" />
      <HebrewText size="xl">{word.nikud ?? word.hebrew}</HebrewText>
      {word.nikud && <div><HebrewText size="sm">{word.hebrew}</HebrewText></div>}
      <div className="flashcard-translit">{word.transliteration}</div>
      <div className="task-translation">{word.russian}</div>
      <div className="text-muted small mb-2">{getCategoryName(word.category)}</div>
      <SpeakButton text={word.hebrew} />
      {word.mnemonic && <div className="mnemonic mt-2">💡 {word.mnemonic}</div>}
      <div className="word-dialog-status">
        <strong>{BOX_LABELS[progress?.box ?? 0]}</strong>
        {progress && progress.seen > 0 && (
          <div className="small text-muted">
            Ответов: {progress.correct} верно, {progress.wrong} с ошибкой
            {progress.box > 0 && <> · повторить {formatDay(progress.due)}</>}
          </div>
        )}
      </div>
      <button className="btn btn-success btn-lg w-100 mt-3" onClick={onClose}>
        Закрыть
      </button>
    </div>
  </div>
);

export default WordDialog;
