// Доступна ли озвучка: есть голос иврита и она включена в настройках

import { useEffect, useState } from 'react';
import { findHebrewVoice, waitForHebrewVoice } from '../core/speech';
import { useSettings } from '../state/progressContext';

/** Есть ли на устройстве голос иврита (без учёта настроек) */
export const useHebrewVoice = (): boolean | null => {
  const [available, setAvailable] = useState<boolean | null>(() => (findHebrewVoice() ? true : null));
  useEffect(() => {
    let active = true;
    waitForHebrewVoice().then(ok => active && setAvailable(ok));
    return () => {
      active = false;
    };
  }, []);
  return available;
};

/** Можно ли сейчас озвучивать слова */
export const useSpeechAvailable = (): boolean => {
  const voice = useHebrewVoice();
  const { tts } = useSettings();
  return tts && voice === true;
};
