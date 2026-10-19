# Обновление: Поддержка SVG-картинок

## Дата: 2025-11-04

## Описание изменений

Добавлена поддержка SVG-картинок для слов, для которых нет подходящих эмодзи (например, "стол", "стул" и т.д.).

## Изменённые файлы

### 1. Типы данных (`src/types/index.ts`)

**Было:**
```typescript
interface Word {
  id: string;
  emoji: string;  // обязательное поле
  ...
}
```

**Стало:**
```typescript
interface Word {
  id: string;
  emoji?: string;    // опционально
  picture?: string;  // опционально
  ...
}
```

Теперь слово может иметь либо `emoji`, либо `picture`.

### 2. Компонент отображения

**Удалён**: `src/components/EmojiDisplay.tsx`  
**Создан**: `src/components/WordImage.tsx`

Новый компонент умеет отображать:
- Эмодзи (если передан `emoji`)
- SVG-картинки (если передан `picture`)
- Плейсхолдер ❓ (если ничего не передано)

### 3. Обновлённые игры

Все 4 игры обновлены для использования `WordImage`:
- `Game1LetterChoice.tsx`
- `Game2LetterInput.tsx`
- `Game3WordChoice.tsx`
- `Game4WordInput.tsx`

**Было:**
```tsx
import EmojiDisplay from '../EmojiDisplay';
<EmojiDisplay emoji={currentWord.emoji} size="large" />
```

**Стало:**
```tsx
import WordImage from '../WordImage';
<WordImage 
  emoji={currentWord.emoji} 
  picture={currentWord.picture} 
  alt={currentWord.russian} 
  size="large" 
/>
```

### 4. Стили (`src/styles/games.css`)

Добавлены новые CSS-классы:
- `.word-image-emoji` - для эмодзи
- `.word-image-picture` - для картинок
- `.word-image-svg` - для SVG элементов
- `.word-image-placeholder` - для плейсхолдера
- `.word-image-small` / `.word-image-large` - размеры

### 5. Документация

Обновлены файлы:
- `README.md` - добавлена информация о поддержке картинок
- `WORD_FORMAT.md` (новый) - подробное описание формата данных
- `CHANGELOG_PICTURES.md` (этот файл) - описание изменений

## Пример использования

### Добавление слова с картинкой

1. Поместите SVG-файл в `public/pictures/` (например, `table.svg`)

2. Добавьте слово в `src/data/words.json`:
```json
{
  "id": "table",
  "picture": "table.svg",
  "hebrew": "שולחן",
  "russian": "стол",
  "transliteration": "shulchan",
  "category": "home",
  "difficulty": 1
}
```

3. Компонент `WordImage` автоматически загрузит и отобразит картинку

## Обратная совместимость

✅ Все существующие слова с эмодзи продолжают работать без изменений.  
✅ Можно смешивать слова с эмодзи и картинками в одном словаре.  
✅ Компонент `WordImage` автоматически определяет, что отображать.

## Исправление для production build (04.11.2025)

### Проблема
При сборке через `yarn build` картинки из `src/assets/pictures/` не копировались в выходную папку.

### Решение
✅ Картинки перемещены в `public/pictures/`  
✅ Компонент `WordImage` обновлён: путь изменён с `/src/assets/pictures/` на `/pictures/`  
✅ Vite автоматически копирует содержимое `public/` при сборке

### Технические детали
- В dev-режиме: файлы доступны по адресу `http://localhost:5173/pictures/image.png`
- В production: файлы копируются в `dist/pictures/` (или `docs/pictures/`) автоматически
- Не требуется дополнительная настройка Vite

## Что дальше?

- [ ] Добавить больше картинок для слов без эмодзи
- [ ] Оптимизировать размеры PNG-файлов (конвертировать в SVG где возможно)
- [ ] Добавить fallback для загрузки картинок (если файл не найден)
- [ ] Рассмотреть возможность использования WebP формата для лучшей компрессии

