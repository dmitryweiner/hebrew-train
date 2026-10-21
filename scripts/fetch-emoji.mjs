// Скачивает SVG Twemoji для всех эмодзи из словаря в public/emoji.
// Эти картинки показываются вместо эмодзи, которых нет в шрифте устройства.
// Запуск: node scripts/fetch-emoji.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/';
const OUT = new URL('../public/emoji/', import.meta.url);
const words = JSON.parse(readFileSync(new URL('../src/data/words.json', import.meta.url), 'utf8'));

const codePoints = emoji => [...emoji].map(ch => ch.codePointAt(0).toString(16));
// Та же схема, что в src/utils/emojiSupport.ts
const fileName = emoji => codePoints(emoji).filter(cp => cp !== 'fe0f').join('-') + '.svg';

mkdirSync(OUT, { recursive: true });
let failed = 0;
for (const { id, emoji } of words.filter(w => w.emoji)) {
  const target = new URL(fileName(emoji), OUT);
  if (existsSync(target)) continue;
  // Twemoji хранит ZWJ-последовательности с FE0F, одиночные — без
  const candidates = [fileName(emoji), codePoints(emoji).join('-') + '.svg'];
  let svg = null;
  for (const name of candidates) {
    const res = await fetch(BASE + name);
    if (res.ok) { svg = await res.text(); break; }
  }
  if (svg) {
    writeFileSync(target, svg);
    console.log('ok  ', emoji, id);
  } else {
    failed++;
    console.error('FAIL', emoji, id, candidates.join(' / '));
  }
}
process.exit(failed ? 1 : 0);
