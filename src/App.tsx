// Главный компонент приложения

import { useState } from 'react';
import type { GameType, Word } from './types';
import GameMenu from './components/GameMenu';
import { useScore } from './hooks/useScore';
import wordsData from './data/words.json';
import { Game1LetterChoice } from './components/games/Game1LetterChoice';
import { Game2LetterInput } from './components/games/Game2LetterInput';
import { Game3WordChoice } from './components/games/Game3WordChoice';
import { Game4WordInput } from './components/games/Game4WordInput';
import UpdateBanner from './pwa/UpdateBanner';
import InstallCard from './pwa/InstallCard';
import BackupCard from './pwa/BackupCard';

function App() {
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const { allStats } = useScore(currentGame);

  const handleSelectGame = (gameType: GameType) => {
    setCurrentGame(gameType);
  };

  const handleBackToMenu = () => {
    setCurrentGame(null);
  };

  // Приводим данные словаря к типу Word[]
  const words: Word[] = wordsData as Word[];

  return (
    <div className="app-container min-vh-100 bg-light">
      {!currentGame ? (
        <main className="container py-4">
          <GameMenu onSelectGame={handleSelectGame} stats={allStats} />
          <div className="mt-4">
            <InstallCard />
            <BackupCard />
          </div>
        </main>
      ) : (
        <main>
          {currentGame === 'letter-choice' && (
            <Game1LetterChoice words={words} onExit={handleBackToMenu} />
          )}
          {currentGame === 'letter-input' && (
            <Game2LetterInput words={words} onExit={handleBackToMenu} />
          )}
          {currentGame === 'word-choice' && (
            <Game3WordChoice words={words} onExit={handleBackToMenu} />
          )}
          {currentGame === 'word-input' && (
            <Game4WordInput words={words} onExit={handleBackToMenu} />
          )}
          {/* Остальные игры пока не реализованы */}
          {!['letter-choice', 'letter-input', 'word-choice', 'word-input'].includes(currentGame) && (
            <div className="container mt-5">
              <div className="alert alert-info text-center">
                <h2>🚧 Игра "{getGameTitle(currentGame)}" в разработке</h2>
                <p className="mb-3">Эта игра будет реализована в следующей версии</p>
                <button onClick={handleBackToMenu} className="btn btn-primary">
                  ← Вернуться в меню
                </button>
              </div>
            </div>
          )}
        </main>
      )}
      <UpdateBanner />
    </div>
  );
}

function getGameTitle(gameType: GameType): string {
  const titles: Record<GameType, string> = {
    'letter-choice': 'Буква (выбор)',
    'letter-input': 'Буква (ввод)',
    'word-choice': 'Слово (выбор)',
    'word-input': 'Слово (ввод)',
    'anagram': 'Составь слово',
    'matching': 'Найди пары',
    'speed': 'Проверь себя',
  };
  return titles[gameType] || gameType;
}

export default App;
