import { describe, it, expect, beforeEach } from 'vitest';
import { createBackup, restoreBackup, backupFileName } from '../backup';

describe('backup', () => {
  beforeEach(() => localStorage.clear());

  it('сохраняет только ключи приложения', () => {
    localStorage.setItem('hebrew-train/v2', '{"a":1}');
    localStorage.setItem('other-app', 'x');
    const backup = createBackup();
    expect(Object.keys(backup.data)).toEqual(['hebrew-train/v2']);
    expect(backup.format).toBe('hebrew-train-backup');
  });

  it('восстанавливает данные и удаляет старые ключи приложения', () => {
    localStorage.setItem('hebrew-train/v2', 'old');
    localStorage.setItem('hebrew-train-stats', 'legacy');
    localStorage.setItem('other-app', 'keep');
    restoreBackup(JSON.stringify({ format: 'hebrew-train-backup', createdAt: '', data: { 'hebrew-train/v2': 'new' } }));
    expect(localStorage.getItem('hebrew-train/v2')).toBe('new');
    expect(localStorage.getItem('hebrew-train-stats')).toBeNull();
    expect(localStorage.getItem('other-app')).toBe('keep');
  });

  it('игнорирует чужие ключи внутри копии', () => {
    restoreBackup(JSON.stringify({ format: 'hebrew-train-backup', createdAt: '', data: { evil: 'x', 'hebrew-train/v2': 'ok' } }));
    expect(localStorage.getItem('evil')).toBeNull();
  });

  it('отклоняет неверный файл и не трогает данные', () => {
    localStorage.setItem('hebrew-train/v2', 'keep');
    expect(() => restoreBackup('not json')).toThrow('повреждён');
    expect(() => restoreBackup('{"foo":1}')).toThrow('не резервная копия');
    expect(localStorage.getItem('hebrew-train/v2')).toBe('keep');
  });

  it('имя файла содержит дату', () => {
    expect(backupFileName(new Date('2026-10-19T10:00:00Z'))).toBe('ivrit-progress-2026-10-19.json');
  });
});
