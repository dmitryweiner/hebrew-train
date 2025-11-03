// Хук для управления счётом в играх

import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { GameType, GameStats, GameScore } from '../types';
import { calculatePercentage } from '../utils/gameUtils';

const STORAGE_KEY = 'hebrew-train-stats';

/**
 * Хук для управления счётом и статистикой игр
 */
export const useScore = (gameType: GameType | null) => {
  const [stats, setStats] = useLocalStorage<GameStats>(STORAGE_KEY, {});
  const [currentCorrect, setCurrentCorrect] = useState(0);
  const [currentTotal, setCurrentTotal] = useState(0);

  // Получаем статистику для текущей игры
  const getCurrentGameStats = useCallback((): GameScore => {
    if (!gameType) return { correct: 0, total: 0, percentage: 0 };
    
    const gameStat = stats[gameType];
    return gameStat || { correct: 0, total: 0, percentage: 0 };
  }, [gameType, stats]);

  // Добавляем правильный ответ
  const addCorrect = useCallback(() => {
    setCurrentCorrect(prev => prev + 1);
    setCurrentTotal(prev => prev + 1);

    if (gameType) {
      setStats(prevStats => {
        const gameStats = prevStats[gameType] || { correct: 0, total: 0, percentage: 0 };
        const newCorrect = gameStats.correct + 1;
        const newTotal = gameStats.total + 1;
        
        return {
          ...prevStats,
          [gameType]: {
            correct: newCorrect,
            total: newTotal,
            percentage: calculatePercentage(newCorrect, newTotal),
          },
          lastSession: new Date().toISOString(),
        } as GameStats;
      });
    }
  }, [gameType, setStats]);

  // Добавляем неправильный ответ
  const addIncorrect = useCallback(() => {
    setCurrentTotal(prev => prev + 1);

    if (gameType) {
      setStats(prevStats => {
        const gameStats = prevStats[gameType] || { correct: 0, total: 0, percentage: 0 };
        const newTotal = gameStats.total + 1;
        
        return {
          ...prevStats,
          [gameType]: {
            correct: gameStats.correct,
            total: newTotal,
            percentage: calculatePercentage(gameStats.correct, newTotal),
          },
          lastSession: new Date().toISOString(),
        } as GameStats;
      });
    }
  }, [gameType, setStats]);

  // Сбрасываем текущий счёт сессии
  const resetCurrentScore = useCallback(() => {
    setCurrentCorrect(0);
    setCurrentTotal(0);
  }, []);

  // Сбрасываем всю статистику
  const resetAllStats = useCallback(() => {
    setStats({});
    resetCurrentScore();
  }, [setStats, resetCurrentScore]);

  // Сбрасываем статистику конкретной игры
  const resetGameStats = useCallback((game: GameType) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      delete newStats[game];
      return newStats;
    });
  }, [setStats]);

  // Получаем общую статистику по всем играм
  const getTotalStats = useCallback((): GameScore => {
    const allGames = Object.entries(stats)
      .filter(([key]) => key !== 'lastSession')
      .map(([, value]) => value as GameScore);
    
    const totalCorrect = allGames.reduce((sum, game) => sum + game.correct, 0);
    const totalTotal = allGames.reduce((sum, game) => sum + game.total, 0);
    
    return {
      correct: totalCorrect,
      total: totalTotal,
      percentage: calculatePercentage(totalCorrect, totalTotal),
    };
  }, [stats]);

  return {
    // Текущая сессия
    currentCorrect,
    currentTotal,
    currentPercentage: calculatePercentage(currentCorrect, currentTotal),
    
    // Методы
    addCorrect,
    addIncorrect,
    resetCurrentScore,
    
    // Статистика
    gameStats: getCurrentGameStats(),
    totalStats: getTotalStats(),
    allStats: stats,
    resetAllStats,
    resetGameStats,
  };
};

