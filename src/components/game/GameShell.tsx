// Оболочка игры: кнопка выхода, название, полоска заданий

import type { ReactNode } from 'react';
import type { RoundState } from '../../core/round';

interface GameShellProps {
  title: string;
  icon: string;
  round: RoundState;
  onExit: () => void;
  children: ReactNode;
}

const segmentStatus = (round: RoundState, index: number): string => {
  if (index === round.index) return 'current';
  const answer = round.answers[index];
  if (!answer) return 'todo';
  return answer.results.every(r => r.correct) ? 'ok' : 'bad';
};

const GameShell = ({ title, icon, round, onExit, children }: GameShellProps) => {
  const total = round.tasks.length;
  const position = Math.min(round.index + 1, total);

  return (
    <div className="game-shell">
      <header className="game-header">
        <button className="btn btn-outline-secondary btn-exit" onClick={onExit}>
          ✕ Выйти
        </button>
        <div className="game-title">
          <span aria-hidden>{icon}</span> {title}
        </div>
        <div className="game-counter" aria-label={total > 1 ? `Задание ${position} из ${total}` : undefined}>
          {total > 1 ? `${position} из ${total}` : ''}
        </div>
      </header>
      {total > 1 && (
        <div className="round-progress" aria-hidden>
          {round.tasks.map((task, i) => (
            <span key={task.id} className={`round-progress-segment is-${segmentStatus(round, i)}`} />
          ))}
        </div>
      )}
      <main className="game-body">{children}</main>
    </div>
  );
};

export default GameShell;
