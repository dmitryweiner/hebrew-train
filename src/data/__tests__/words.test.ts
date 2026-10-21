// Валидация словаря words.json

import { describe, it, expect } from 'vitest';
import type { Word } from '../../types';
import wordsData from '../words.json';
import { CATEGORY_NAMES } from '../categories';
import { emojiFileName } from '../../utils/emojiSupport';

const words = wordsData as Word[];
const pictureFiles = Object.keys(import.meta.glob('../../../public/pictures/*')).map(p => p.split('/').pop());
const emojiFiles = Object.keys(import.meta.glob('../../../public/emoji/*')).map(p => p.split('/').pop());

describe('words.json', () => {
  it('у всех слов уникальный id', () => {
    const ids = words.map(w => w.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
  });

  it('у всех слов заполнены обязательные поля', () => {
    for (const w of words) {
      expect(w.id, JSON.stringify(w)).toMatch(/^[a-z0-9_]+$/);
      expect(w.hebrew, w.id).toBeTruthy();
      expect(w.russian, w.id).toBeTruthy();
      expect(w.transliteration, w.id).toBeTruthy();
      expect(CATEGORY_NAMES, w.id).toHaveProperty(w.category);
    }
  });

  it('у каждого слова ровно одна картинка: эмодзи или файл', () => {
    for (const w of words) {
      expect(Boolean(w.emoji) !== Boolean(w.picture), w.id).toBe(true);
    }
  });

  it('файлы картинок существуют', () => {
    for (const w of words.filter(w => w.picture)) {
      expect(pictureFiles, w.id).toContain(w.picture);
    }
  });

  // Нужна для устройств, в шрифте которых нет эмодзи (старые Android): node scripts/fetch-emoji.mjs
  it('у каждого эмодзи есть запасная SVG-картинка', () => {
    for (const w of words.filter(w => w.emoji)) {
      expect(emojiFiles, `${w.id} ${w.emoji}`).toContain(emojiFileName(w.emoji!));
    }
  });

  it('эмодзи не повторяется у разных слов', () => {
    const emojis = words.filter(w => w.emoji).map(w => w.emoji);
    const duplicates = emojis.filter((e, i) => emojis.indexOf(e) !== i);
    expect(duplicates).toEqual([]);
  });

  it('иврит содержит только буквы, пробел и гереш', () => {
    for (const w of words) {
      expect(w.hebrew, w.id).toMatch(/^[א-ת]+([ ׳][א-ת]+)*$/);
    }
  });

  it('ивритские слова не повторяются', () => {
    const hebrew = words.map(w => w.hebrew);
    const duplicates = hebrew.filter((h, i) => hebrew.indexOf(h) !== i);
    expect(duplicates).toEqual([]);
  });

  it('огласовки без знаков совпадают с написанием слова', () => {
    for (const w of words) {
      expect(w.nikud, w.id).toBeTruthy();
      expect(w.nikud!.replace(/[\u0591-\u05C7]/g, ''), w.id).toBe(w.hebrew);
    }
  });

  it('у каждого слова есть мнемоника и хотя бы один тег', () => {
    for (const w of words) {
      expect(w.mnemonic, w.id).toBeTruthy();
      expect(w.tags?.length, w.id).toBeGreaterThan(0);
      for (const tag of w.tags!) expect(tag, w.id).toMatch(/^[a-z]+$/);
    }
  });
});
