// Карточка «Резервная копия прогресса»

import { useRef, useState } from 'react';
import { downloadBackup, restoreBackup } from './backup';

const BackupCard = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      restoreBackup(await file.text());
      setMessage({ ok: true, text: 'Прогресс загружен' });
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    }
  };

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="fw-bold mb-1">💾 Резервная копия</div>
        <div className="small text-muted mb-3">
          Прогресс хранится только на этом телефоне. Сохраните его в файл, чтобы не потерять при смене телефона.
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <button className="btn btn-outline-primary flex-fill" onClick={() => downloadBackup()}>
            Сохранить в файл
          </button>
          <button className="btn btn-outline-secondary flex-fill" onClick={() => inputRef.current?.click()}>
            Загрузить из файла
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="d-none"
          onChange={handleFile}
          data-testid="backup-input"
        />
        {message && (
          <div className={`alert ${message.ok ? 'alert-success' : 'alert-danger'} py-2 mt-3 mb-0`} role="status">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupCard;
