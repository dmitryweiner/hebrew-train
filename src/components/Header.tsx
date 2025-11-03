// Компонент заголовка со счётчиком

import React from 'react';
import { formatScore, getScoreColor } from '../utils/gameUtils';

interface HeaderProps {
  correct: number;
  total: number;
  title?: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ correct, total, title = 'Hebrew Train', onMenuClick }) => {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const colorClass = getScoreColor(percentage);

  return (
    <header className="header bg-primary text-white shadow-sm sticky-top">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center gap-3">
            {onMenuClick && (
              <button
                className="btn btn-light btn-sm"
                onClick={onMenuClick}
                aria-label="Меню"
              >
                ☰
              </button>
            )}
            <h1 className="h4 mb-0">{title}</h1>
          </div>
          
          <div className="score-display">
            {total > 0 ? (
              <div className={`badge bg-${colorClass} fs-6 px-3 py-2`}>
                {formatScore(correct, total)}
              </div>
            ) : (
              <div className="badge bg-light text-dark fs-6 px-3 py-2">
                Начните игру
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

