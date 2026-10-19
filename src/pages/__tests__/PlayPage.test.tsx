import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { WORD_BY_ID } from '../../data/dictionary';
import { ProgressProvider } from '../../state/ProgressProvider';
import { STORAGE_KEY } from '../../core/storage';
import PlayPage from '../PlayPage';
import HomePage from '../HomePage';

const renderAt = (path: string) => {
  const router = createMemoryRouter(
    [
      { path: '/', element: <HomePage /> },
      { path: '/play/:kind', element: <PlayPage /> },
    ],
    { initialEntries: [path] }
  );
  render(
    <ProgressProvider>
      <RouterProvider router={router} />
    </ProgressProvider>
  );
  return router;
};

/** Отвечает на текущее «Угадай слово»: правильно или неправильно */
const answerWordChoice = (correct: boolean) => {
  const image = document.querySelector('.task .word-image-emoji, .task .word-image-picture img');
  const emoji = image?.textContent || image?.getAttribute('src');
  const word = Object.values(WORD_BY_ID).find(w => w.emoji === emoji || (w.picture && emoji?.endsWith(w.picture)))!;
  const options = [...document.querySelectorAll<HTMLButtonElement>('.option-btn')];
  const target = options.find(o => (o.textContent === word.hebrew) === correct)!;
  fireEvent.click(target);
  fireEvent.click(screen.getByRole('button', { name: 'Дальше →' }));
};

describe('PlayPage', () => {
  beforeEach(() => localStorage.clear());

  it('раунд из указанных слов доходит до итогов и сохраняет прогресс', () => {
    renderAt('/play/word-choice?words=dog,cat');
    expect(screen.getByText('1 из 2')).toBeInTheDocument();
    answerWordChoice(true);
    answerWordChoice(false);
    // Ошибка возвращает слово в конец раунда
    expect(screen.getByText('3 из 3')).toBeInTheDocument();
    answerWordChoice(true);

    expect(screen.getByText('Правильно', { exact: false })).toHaveTextContent('Правильно 1 из 2');
    expect(screen.getByRole('button', { name: /Повторить ошибки \(1\)/ })).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.games['word-choice']).toMatchObject({ rounds: 1, totalAnswers: 2, totalCorrect: 1 });
    expect(saved.words.dog.box).toBe(1);
    expect(saved.words.cat.box).toBe(1);
  });

  it('выход посреди раунда спрашивает подтверждение', async () => {
    const router = renderAt('/play/word-choice?words=dog,cat');
    answerWordChoice(true);
    fireEvent.click(screen.getByRole('button', { name: '✕ Выйти' }));
    expect(await screen.findByText('Прервать раунд?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Продолжить раунд' }));
    expect(router.state.location.pathname).toBe('/play/word-choice');
    fireEvent.click(screen.getByRole('button', { name: '✕ Выйти' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Выйти в меню' }));
    expect(await screen.findByText('Мой словарь')).toBeInTheDocument();
  });

  it('неизвестная игра перенаправляет на главную', async () => {
    renderAt('/play/unknown');
    expect(await screen.findByText('Мой словарь')).toBeInTheDocument();
  });
});
