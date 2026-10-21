// Компонент отображения эмодзи или картинки для слова

import React, { useState } from 'react';
import { emojiFileName, isEmojiSupported } from '../utils/emojiSupport';

interface WordImageProps {
  emoji?: string;
  picture?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const WordImage: React.FC<WordImageProps> = ({ 
  emoji, 
  picture, 
  alt = 'изображение слова',
  size = 'medium', 
  className = '' 
}) => {
  // Если встроенная картинка вдруг не загрузилась — остаётся эмодзи текстом
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const sizeClass = {
    small: 'word-image-small',
    medium: 'word-image',
    large: 'word-image-large',
  }[size];

  // Если есть эмодзи, отображаем его; если шрифт устройства его не знает — SVG-копию
  if (emoji) {
    const useFallback = !fallbackFailed && !isEmojiSupported(emoji);
    return (
      <div 
        className={`word-image-emoji ${sizeClass} ${className}`} 
        role="img" 
        aria-label={alt}
      >
        {useFallback ? (
          <img
            src={`./emoji/${emojiFileName(emoji)}`}
            alt=""
            className="word-image-emoji-img"
            onError={() => setFallbackFailed(true)}
          />
        ) : emoji}
      </div>
    );
  }

  // Если есть картинка, отображаем изображение
  if (picture) {
    return (
      <div className={`word-image-picture ${sizeClass} ${className}`}>
        <img 
          src={`./pictures/${picture}`} 
          alt={alt}
          className="word-image-svg"
        />
      </div>
    );
  }

  // Если ничего не передано, показываем плейсхолдер
  return (
    <div 
      className={`word-image-placeholder ${sizeClass} ${className}`}
      role="img"
      aria-label="изображение отсутствует"
    >
      ❓
    </div>
  );
};

export default WordImage;

