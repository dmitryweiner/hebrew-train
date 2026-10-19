// Баннер «Доступна новая версия» и регистрация service worker

import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

const UpdateBanner = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      // Раз в час проверяем, не вышла ли новая версия (приложение может быть открыто днями)
      setInterval(() => {
        if (navigator.onLine) registration.update();
      }, UPDATE_CHECK_INTERVAL);
    },
  });

  useEffect(() => {
    // Просим браузер не удалять данные приложения при нехватке места
    navigator.storage?.persist?.().catch(() => undefined);
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="update-banner shadow" role="status">
      <span>Доступна новая версия</span>
      <div className="d-flex gap-2">
        <button className="btn btn-light btn-sm" onClick={() => setNeedRefresh(false)}>
          Позже
        </button>
        <button className="btn btn-warning btn-sm" onClick={() => updateServiceWorker(true)}>
          Обновить
        </button>
      </div>
    </div>
  );
};

export default UpdateBanner;
