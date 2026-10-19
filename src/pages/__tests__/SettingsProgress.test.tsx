import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ProgressProvider } from '../../state/ProgressProvider';
import { createProgress, type Progress } from '../../core/progress';
import { STORAGE_KEY } from '../../core/storage';
import { toDay } from '../../core/dates';
import SettingsPage from '../SettingsPage';
import ProgressPage from '../ProgressPage';
import HomePage from '../HomePage';

const renderAt = (path: string, progress: Progress = createProgress()) => {
  const router = createMemoryRouter(
    [
      { path: '/', element: <HomePage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/progress', element: <ProgressPage /> },
    ],
    { initialEntries: [path] }
  );
  render(
    <ProgressProvider initialProgress={progress}>
      <RouterProvider router={router} />
    </ProgressProvider>
  );
};

const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Progress;

describe('Настройки', () => {
  beforeEach(() => localStorage.clear());

  it('размер шрифта меняет CSS-переменную и сохраняется', () => {
    renderAt('/settings');
    fireEvent.click(screen.getByRole('button', { name: 'A++' }));
    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe('1.3');
    expect(saved().settings.fontScale).toBe(1.3);
  });

  it('выключатели звука и письма', () => {
    renderAt('/settings');
    fireEvent.click(screen.getByRole('switch', { name: /Звуки ответов/ }));
    fireEvent.click(screen.getByRole('switch', { name: /Задания с письмом/ }));
    expect(saved().settings).toMatchObject({ sound: false, typing: false });
    expect(screen.queryByRole('switch', { name: /Экранная клавиатура/ })).toBeNull();
  });

  it('сброс прогресса спрашивает подтверждение и сохраняет настройки', async () => {
    const p = createProgress();
    p.words.dog = { box: 3, due: '2026-01-01', seen: 3, correct: 3, wrong: 0, lastSeen: '2026-01-01' };
    p.settings.sound = false;
    renderAt('/settings', p);
    fireEvent.click(screen.getByRole('button', { name: 'Сбросить прогресс' }));
    fireEvent.click(screen.getByRole('button', { name: 'Да, сбросить' }));
    expect(await screen.findByText('Мой словарь')).toBeInTheDocument();
    expect(saved().words).toEqual({});
    expect(saved().settings.sound).toBe(false);
  });
});

describe('Прогресс', () => {
  beforeEach(() => localStorage.clear());

  it('показывает трудные слова и карточку слова', () => {
    const p = createProgress();
    p.words.dog = { box: 1, due: toDay(), seen: 5, correct: 1, wrong: 4, lastSeen: toDay() };
    p.words.cat = { box: 4, due: '2099-01-01', seen: 4, correct: 4, wrong: 0, lastSeen: toDay() };
    renderAt('/progress', p);
    expect(screen.getByText('Трудные слова')).toBeInTheDocument();
    expect(screen.getByText('ошибок: 4')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Повторить эти слова/ })).toHaveAttribute('href', '/play/word-choice?words=dog');
    fireEvent.click(screen.getAllByRole('button', { name: /кот/ })[0]);
    expect(screen.getByRole('dialog', { name: 'кот' })).toHaveTextContent('Выучено');
  });

  it('фильтр по теме', () => {
    renderAt('/progress');
    fireEvent.change(screen.getByRole('combobox', { name: 'Тема' }), { target: { value: 'body' } });
    expect(screen.getByText('глаз')).toBeInTheDocument();
    expect(screen.queryByText('яблоко')).toBeNull();
  });
});
