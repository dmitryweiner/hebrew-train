// Компонент поля ввода с поддержкой иврита

import React, { useRef, useEffect } from 'react';
import { useHebrewInput } from '../hooks/useHebrewInput';

interface HebrewInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  placeholder?: string;
  autoFocus?: boolean;
  singleLetter?: boolean;
  disabled?: boolean;
  className?: string;
}

const HebrewInput: React.FC<HebrewInputProps> = ({
  value,
  onChange,
  onSubmit,
  maxLength,
  placeholder = '',
  autoFocus = true,
  singleLetter = false,
  disabled = false,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { showWarning, handleKeyDown } = useHebrewInput({
    maxLength,
    onSubmit,
  });

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputClassName = `hebrew-input ${singleLetter ? 'hebrew-input-single' : ''} ${className}`;

  return (
    <div className="hebrew-input-container">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          handleKeyDown(e);
          if (e.key === 'Enter') {
            onSubmit();
          }
        }}
        maxLength={maxLength}
        placeholder={placeholder}
        dir="rtl"
        lang="he"
        inputMode="text"
        autoFocus={autoFocus}
        disabled={disabled}
        className={inputClassName}
        aria-label="Поле ввода на иврите"
      />
      {showWarning && (
        <div className="keyboard-warning" role="alert">
          🔤 Переключите клавиатуру на иврит
        </div>
      )}
    </div>
  );
};

export default HebrewInput;

