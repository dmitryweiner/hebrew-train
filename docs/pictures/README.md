# Картинки для слов

Эта папка содержит изображения (SVG, PNG) для слов, у которых нет подходящих эмодзи.

## Структура

- `table.svg` - стол (שולחן)
- `carpet.png` - ковёр (שטיח)
- `pillow.png` - подушка (כר)
- `refrigerator.png` - холодильник (מקרר)
- `towel.png` - полотенце (מגבת)

## Как добавить новую картинку

1. Добавьте файл изображения в эту папку
2. Рекомендуемый формат: SVG (масштабируется без потери качества)
3. Альтернатива: PNG с прозрачным фоном, размер ~100-200px
4. Добавьте запись в `src/data/words.json`:

```json
{
  "id": "your-word-id",
  "picture": "filename.svg",
  "hebrew": "ивритское слово",
  "russian": "перевод",
  "transliteration": "transliteratsiya",
  "category": "category",
  "difficulty": 1
}
```

## Технические детали

- Файлы из `public/` автоматически копируются в выходную папку при сборке
- Доступ к картинкам: `/pictures/filename.ext`
- В dev-режиме: `http://localhost:5173/pictures/filename.ext`
- В production: копируется в `dist/pictures/` или `docs/pictures/`

