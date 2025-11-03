// Главный компонент приложения

import { useState } from 'react';
import type { GameType } from './types';
import Header from './components/Header';
import GameMenu from './components/GameMenu';
import { useScore } from './hooks/useScore';
import wordsData from './data/words.json';

function App() {
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const { currentCorrect, currentTotal, allStats } = useScore(currentGame);

  const handleSelectGame = (gameType: GameType) => {
    setCurrentGame(gameType);
  };

  const handleBackToMenu = () => {
    setCurrentGame(null);
  };

  return (
    <div className="app-container">
      <Header
        correct={currentCorrect}
        total={currentTotal}
        title={currentGame ? getGameTitle(currentGame) : 'Hebrew Train'}
        onMenuClick={currentGame ? handleBackToMenu : undefined}
      />
      
      <main className="main-content">
        {!currentGame ? (
          <GameMenu onSelectGame={handleSelectGame} stats={allStats} />
        ) : (
          <div className="game-content">
            <div className="alert alert-info text-center">
              <h2>🚧 Игра "{getGameTitle(currentGame)}" в разработке</h2>
              <p>Компоненты игр будут реализованы на следующем этапе</p>
              <p className="mb-0">Всего слов в словаре: {wordsData.length}</p>
            </div>
          </div>
        )}
      </main>
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
