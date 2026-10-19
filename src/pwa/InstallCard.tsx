// Карточка «Установить на телефон»

import { useState } from 'react';
import { useInstallPrompt } from './useInstallPrompt';

const InstallCard = () => {
  const { mode, install } = useInstallPrompt();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (!mode) return null;

  return (
    <div className="card shadow-sm mb-3 install-card">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3">
          <div className="fs-1">📲</div>
          <div className="flex-grow-1">
            <div className="fw-bold">Установить на телефон</div>
            <div className="small text-muted">Значок на экране и работа без интернета</div>
          </div>
        </div>
        {mode === 'prompt' ? (
          <button className="btn btn-success w-100 mt-3" onClick={install}>
            Установить
          </button>
        ) : (
          <>
            <button className="btn btn-outline-success w-100 mt-3" onClick={() => setShowIosHelp(v => !v)}>
              Как установить
            </button>
            {showIosHelp && (
              <ol className="mt-3 mb-0 install-steps">
                <li>Нажмите кнопку «Поделиться» <span aria-hidden>⬆️</span> внизу экрана Safari</li>
                <li>Выберите «На экран „Домой“»</li>
                <li>Нажмите «Добавить»</li>
              </ol>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstallCard;
