// Собери слово: перемешанные плитки букв (+2 лишние) → клетки справа налево

import { useState } from 'react';
import { WORD_BY_ID } from '../data/dictionary';
import { compareHebrewWords, getRandomHebrewLetter, isHebrewLetter, normalizeFinalLetters } from '../utils/hebrewUtils';
import { shuffleArray } from '../utils/wordUtils';
import WordImage from '../components/WordImage';
import AnswerFeedback from '../components/game/AnswerFeedback';
import type { TaskProps } from './types';

const EXTRA_TILES = 2;

interface Tile {
  id: number;
  letter: string;
}

const makeTiles = (word: string): Tile[] => {
  const letters = Array.from(word).filter(isHebrewLetter);
  const used = letters.map(normalizeFinalLetters);
  const extra: string[] = [];
  for (let i = 0; i < EXTRA_TILES; i++) {
    const letter = getRandomHebrewLetter([...used, ...extra]);
    if (letter) extra.push(letter);
  }
  return shuffleArray([...letters, ...extra]).map((letter, id) => ({ id, letter }));
};

const AnagramTask = ({ task, onDone }: TaskProps) => {
  const word = WORD_BY_ID[task.wordIds[0]];
  const chars = Array.from(word.hebrew);
  const letterSlots = chars.map((c, i) => (isHebrewLetter(c) ? i : -1)).filter(i => i >= 0);
  const [tiles] = useState(() => makeTiles(word.hebrew));
  // Для каждой буквенной позиции слова — id плитки или null
  const [slots, setSlots] = useState<(number | null)[]>(() => letterSlots.map(() => null));
  const [mistake, setMistake] = useState(false);
  const [wrongNow, setWrongNow] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const tileById = (id: number | null) => tiles.find(t => t.id === id);
  const usedTiles = new Set(slots.filter((s): s is number => s !== null));

  const check = (next: (number | null)[]) => {
    if (next.some(s => s === null)) return;
    const built = [...chars];
    letterSlots.forEach((pos, i) => (built[pos] = tileById(next[i])!.letter));
    if (compareHebrewWords(built.join(''), word.hebrew)) {
      setResult(!mistake);
    } else {
      setMistake(true);
      setWrongNow(true);
    }
  };

  const placeTile = (tile: Tile) => {
    if (result !== null || usedTiles.has(tile.id)) return;
    const empty = slots.indexOf(null);
    if (empty < 0) return;
    const next = [...slots];
    next[empty] = tile.id;
    setSlots(next);
    setWrongNow(false);
    check(next);
  };

  const clearSlot = (index: number) => {
    if (result !== null || slots[index] === null) return;
    const next = [...slots];
    next[index] = null;
    setSlots(next);
    setWrongNow(false);
  };

  return (
    <div className="task">
      <p className="task-prompt">Соберите слово из букв</p>
      <WordImage emoji={word.emoji} picture={word.picture} alt={word.russian} size="large" />
      <div className="task-translation">{word.russian}</div>

      <div className={`anagram-slots ${wrongNow ? 'shake' : ''}`} dir="rtl" lang="he">
        {chars.map((c, pos) => {
          const slotIndex = letterSlots.indexOf(pos);
          if (slotIndex < 0) return <span key={pos} className="anagram-fixed">{c === ' ' ? ' ' : c}</span>;
          const tile = tileById(slots[slotIndex]);
          return (
            <button
              key={pos}
              className={`anagram-slot ${tile ? 'is-filled' : ''} ${wrongNow ? 'is-wrong' : ''} ${result !== null ? 'is-correct' : ''}`}
              onClick={() => clearSlot(slotIndex)}
              aria-label={tile ? `буква ${tile.letter}, нажмите, чтобы убрать` : 'пустая клетка'}
            >
              {tile?.letter ?? ''}
            </button>
          );
        })}
      </div>
      {wrongNow && <div className="text-danger">Не так. Нажмите на букву в клетке, чтобы убрать её</div>}

      {result === null && (
        <>
          <div className="anagram-tiles" dir="rtl" lang="he">
            {tiles.map(tile => (
              <button
                key={tile.id}
                className={`anagram-tile ${usedTiles.has(tile.id) ? 'is-used' : ''}`}
                disabled={usedTiles.has(tile.id)}
                onClick={() => placeTile(tile)}
              >
                {tile.letter}
              </button>
            ))}
          </div>
          <button className="btn btn-link text-muted" onClick={() => setResult(false)}>
            Не знаю, показать ответ
          </button>
        </>
      )}

      {result !== null && (
        <AnswerFeedback word={word} correct={result} onNext={() => onDone([{ wordId: word.id, correct: result }])} />
      )}
    </div>
  );
};

export default AnagramTask;
