// Резервная копия прогресса: экспорт и импорт всех ключей приложения из localStorage

export const STORAGE_PREFIX = 'hebrew-train';
const BACKUP_FORMAT = 'hebrew-train-backup';

export interface Backup {
  format: typeof BACKUP_FORMAT;
  createdAt: string;
  data: Record<string, string>;
}

export const createBackup = (storage: Storage = localStorage): Backup => {
  const data: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) data[key] = storage.getItem(key) ?? '';
  }
  return { format: BACKUP_FORMAT, createdAt: new Date().toISOString(), data };
};

/**
 * Проверяет файл резервной копии и записывает его в хранилище.
 * Бросает ошибку с понятным текстом, если файл не подходит.
 */
export const restoreBackup = (json: string, storage: Storage = localStorage): void => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Файл повреждён или это не резервная копия');
  }
  const backup = parsed as Partial<Backup>;
  if (backup?.format !== BACKUP_FORMAT || typeof backup.data !== 'object' || backup.data === null) {
    throw new Error('Это не резервная копия тренажёра');
  }
  const entries = Object.entries(backup.data).filter(
    ([key, value]) => key.startsWith(STORAGE_PREFIX) && typeof value === 'string'
  );
  for (let i = storage.length - 1; i >= 0; i--) {
    const key = storage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) storage.removeItem(key);
  }
  for (const [key, value] of entries) storage.setItem(key, value);
};

export const backupFileName = (date = new Date()): string =>
  `ivrit-progress-${date.toISOString().slice(0, 10)}.json`;

/** Отдаёт файл пользователю: через «Поделиться», если доступно, иначе скачиванием */
export const downloadBackup = async (): Promise<void> => {
  const json = JSON.stringify(createBackup(), null, 2);
  const name = backupFileName();
  const file = new File([json], name, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Прогресс в тренажёре иврита' });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
