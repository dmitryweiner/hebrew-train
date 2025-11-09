// Модальное окно для отображения правильного ответа

import React from 'react';
import type { Word } from '../types';
import WordImage from './WordImage';

interface SuccessModalProps {
  show: boolean;
  word: Word;
  onNext: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ show, word, onNext }) => {
  if (!show) return null;

  return (
    <>
      {/* Оверлей */}
      <div 
        className="modal-backdrop fade show" 
        style={{ zIndex: 1040 }}
      />
      
      {/* Модальное окно */}
      <div 
        className="modal fade show d-block" 
        tabIndex={-1} 
        style={{ zIndex: 1050 }}
        onClick={onNext}
      >
        <div 
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              {/* Иконка успеха */}
              <div 
                className="mb-3" 
                style={{ 
                  fontSize: '48px',
                  animation: 'scaleIn 0.3s ease-out'
                }}
              >
                ✓
              </div>
              
              {/* Сообщение */}
              <h3 className="text-success mb-4">
                Правильно!
              </h3>

              {/* Эмодзи/картинка */}
              <WordImage 
                emoji={word.emoji} 
                picture={word.picture} 
                alt={word.russian} 
                size="large" 
              />

              {/* Слово на иврите */}
              <div 
                className="display-5 my-3 fw-bold"
                style={{ 
                  fontFamily: 'Arial, sans-serif',
                  direction: 'rtl',
                  letterSpacing: '0.1em',
                }}
              >
                {word.hebrew}
              </div>

              {/* Перевод */}
              <div className="text-muted mb-4" style={{ fontSize: '18px' }}>
                {word.russian}
              </div>

              {/* Кнопка "Дальше" */}
              <button
                onClick={onNext}
                className="btn btn-primary btn-lg w-100"
                style={{ minHeight: '50px', fontSize: '20px' }}
                autoFocus
              >
                Дальше! →
              </button>

              {/* Подсказка */}
              <div className="text-muted small mt-3">
                Нажмите в любом месте или кнопку "Дальше"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS анимации */}
      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.5);
        }
        
        .modal-content {
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
};

export default SuccessModal;

