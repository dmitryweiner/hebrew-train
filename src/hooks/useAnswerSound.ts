// Звук ответа с учётом настройки «Звуки ответов»

import { useCallback } from 'react';
import { playAnswerSound } from '../core/sounds';
import { useSettings } from '../state/progressContext';

export const useAnswerSound = (): ((correct: boolean) => void) => {
  const { sound } = useSettings();
  return useCallback((correct: boolean) => {
    if (sound) playAnswerSound(correct);
  }, [sound]);
};
