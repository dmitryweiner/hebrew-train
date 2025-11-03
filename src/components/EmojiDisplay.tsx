// Компонент отображения эмодзи

import React from 'react';

interface EmojiDisplayProps {
  emoji: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const EmojiDisplay: React.FC<EmojiDisplayProps> = ({ emoji, size = 'medium', className = '' }) => {
  const sizeClass = {
    small: 'emoji-display-small',
    medium: 'emoji-display',
    large: 'emoji-display-large',
  }[size];

  return (
    <div className={`emoji-display ${sizeClass} ${className}`} role="img" aria-label={`Эмодзи: ${emoji}`}>
      {emoji}
    </div>
  );
};

export default EmojiDisplay;

