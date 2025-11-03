// Компонент главного меню выбора игры

import React from 'react';
import type { GameType, GameStats } from '../types';

interface GameMenuProps {
  onSelectGame: (gameType: GameType) => void;
  stats: GameStats;
}

interface GameInfo {
  type: GameType;
  title: string;
  description: string;
  difficulty: string;
  icon: string;
}

const games: GameInfo[] = [
  {
    type: 'letter-choice',
    title: 'Буква (выбор)',
    description: 'Выберите пропущенную букву из вариантов',
    difficulty: '⭐',
    icon: '🔤',
  },
  {
    type: 'letter-input',
    title: 'Буква (ввод)',
    description: 'Введите пропущенную букву с клавиатуры',
    difficulty: '⭐⭐',
    icon: '⌨️',
  },
  {
    type: 'word-choice',
    title: 'Слово (выбор)',
    description: 'Выберите правильное слово для эмодзи',
    difficulty: '⭐⭐',
    icon: '📝',
  },
  {
    type: 'word-input',
    title: 'Слово (ввод)',
    description: 'Напишите слово целиком',
    difficulty: '⭐⭐⭐',
    icon: '✍️',
  },
];

const GameMenu: React.FC<GameMenuProps> = ({ onSelectGame, stats }) => {
  const getGameStats = (gameType: GameType) => {
    const gameStat = stats[gameType];
    if (!gameStat || typeof gameStat === 'string' || gameStat.total === 0) {
      return null;
    }
    return gameStat;
  };

  return (
    <div className="game-menu">
      <div className="text-center mb-4">
        <h1 className="display-4 mb-3">🌟 Hebrew Train</h1>
        <p className="lead text-muted">
          Выберите игру для изучения иврита
        </p>
      </div>

      <div className="row g-3">
        {games.map((game) => {
          const gameStat = getGameStats(game.type);
          
          return (
            <div key={game.type} className="col-12 col-md-6">
              <div
                className="card game-card h-100 shadow-sm hover-lift"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectGame(game.type)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectGame(game.type);
                  }
                }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="game-icon fs-1">{game.icon}</div>
                    <div className="text-muted small">{game.difficulty}</div>
                  </div>
                  
                  <h3 className="card-title h5 mb-2">{game.title}</h3>
                  <p className="card-text text-muted small mb-3">
                    {game.description}
                  </p>
                  
                  {gameStat && (
                    <div className="game-stats">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">Прогресс:</span>
                        <span className="badge bg-primary">
                          {gameStat.correct} / {gameStat.total} ({gameStat.percentage}%)
                        </span>
                      </div>
                      <div className="progress mt-2" style={{ height: '4px' }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${gameStat.percentage}%` }}
                          aria-valuenow={gameStat.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default GameMenu;

