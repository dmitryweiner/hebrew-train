// Настройки: размер шрифта, звуки, озвучка, письмо

import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Settings } from '../core/progress';
import { speak } from '../core/speech';
import { useProgress } from '../state/progressContext';
import { useHebrewVoice } from '../hooks/useSpeech';
import { isIos } from '../pwa/useInstallPrompt';
import ConfirmDialog from '../components/game/ConfirmDialog';
import PageHeader from '../components/PageHeader';

const FONT_SCALES: { value: Settings['fontScale']; label: string }[] = [
  { value: 1, label: 'A' },
  { value: 1.15, label: 'A+' },
  { value: 1.3, label: 'A++' },
];

interface ToggleProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const Toggle = ({ label, hint, checked, onChange }: ToggleProps) => (
  <label className="setting-row">
    <span>
      <span className="setting-label">{label}</span>
      {hint && <span className="setting-hint">{hint}</span>}
    </span>
    <span className="form-check form-switch m-0">
      <input
        className="form-check-input setting-switch"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
    </span>
  </label>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const { progress, updateSettings, resetProgress } = useProgress();
  const { settings } = progress;
  const voice = useHebrewVoice();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="page">
      <PageHeader title="Настройки" />

      <section className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="setting-label mb-2">Размер текста</div>
          <div className="btn-group w-100" role="group" aria-label="Размер текста">
            {FONT_SCALES.map(({ value, label }) => (
              <button
                key={value}
                className={`btn btn-lg ${settings.fontScale === value ? 'btn-success' : 'btn-outline-success'}`}
                style={{ fontSize: `${1.1 * value}rem` }}
                onClick={() => updateSettings({ fontScale: value })}
                aria-pressed={settings.fontScale === value}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-2 text-muted">
            Пример: <span className="he he-md" dir="rtl" lang="he">שלום</span> — привет
          </div>
        </div>
      </section>

      <section className="card shadow-sm mb-3">
        <div className="card-body">
          <Toggle
            label="Звуки ответов"
            hint="Короткий сигнал после правильного и неправильного ответа"
            checked={settings.sound}
            onChange={sound => updateSettings({ sound })}
          />
          <Toggle
            label="Озвучка слов"
            hint="Произношение слов на иврите"
            checked={settings.tts}
            onChange={tts => updateSettings({ tts })}
          />
          {settings.tts && voice === true && (
            <button className="btn btn-outline-primary mb-2" onClick={() => speak('שלום')}>
              🔊 Проверить голос
            </button>
          )}
          {settings.tts && voice === false && (
            <div className="alert alert-warning mb-2">
              <strong>На телефоне нет голоса иврита.</strong>
              {isIos() ? (
                <div className="small mt-1">
                  Откройте «Настройки» → «Универсальный доступ» → «Устный контент» → «Голоса» → «Иврит» и загрузите голос Carmit. Затем перезапустите приложение.
                </div>
              ) : (
                <ol className="small mt-1 mb-0 ps-3">
                  <li>Откройте «Настройки» телефона → «Специальные возможности» (или «Система» → «Язык и ввод»).</li>
                  <li>Найдите «Синтез речи» / «Преобразование текста в речь».</li>
                  <li>Выберите «Синтезатор речи Google» → значок шестерёнки → «Установка голосовых данных» → «Иврит» и скачайте.</li>
                  <li>Перезапустите приложение.</li>
                </ol>
              )}
            </div>
          )}
          <Toggle
            label="Задания с письмом"
            hint="«Напиши слово» — для хорошо знакомых слов"
            checked={settings.typing}
            onChange={typing => updateSettings({ typing })}
          />
          {settings.typing && (
            <Toggle
              label="Экранная клавиатура"
              hint="Буквы иврита прямо на экране, не нужно переключать раскладку"
              checked={settings.keyboard === 'screen'}
              onChange={on => updateSettings({ keyboard: on ? 'screen' : 'system' })}
            />
          )}
        </div>
      </section>

      <section className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="setting-label mb-1">Начать заново</div>
          <div className="setting-hint mb-2">Удалит весь прогресс по словам и играм. Настройки сохранятся.</div>
          <button className="btn btn-outline-danger" onClick={() => setConfirmReset(true)}>
            Сбросить прогресс
          </button>
        </div>
      </section>

      {confirmReset && (
        <ConfirmDialog
          title="Сбросить весь прогресс?"
          text="Это нельзя отменить. Если нужно, сначала сохраните резервную копию на странице «Прогресс»."
          confirmLabel="Да, сбросить"
          cancelLabel="Отмена"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            resetProgress();
            setConfirmReset(false);
            navigate('/');
          }}
        />
      )}
    </div>
  );
};

export default SettingsPage;
