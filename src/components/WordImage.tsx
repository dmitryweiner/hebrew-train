// Компонент отображения эмодзи или картинки для слова

import React from 'react';

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
  const sizeClass = {
    small: 'word-image-small',
    medium: 'word-image',
    large: 'word-image-large',
  }[size];

  // Если есть эмодзи, отображаем его
  if (emoji) {
    return (
      <div 
        className={`word-image-emoji ${sizeClass} ${className}`} 
        role="img" 
        aria-label={alt}
      >
        {emoji}
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

