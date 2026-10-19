// Слово на иврите: направление справа налево и крупный шрифт

import type { ReactNode } from 'react';

interface HebrewTextProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const HebrewText = ({ children, size = 'md', className = '' }: HebrewTextProps) => (
  <span className={`he he-${size} ${className}`} dir="rtl" lang="he">
    {children}
  </span>
);

export default HebrewText;
