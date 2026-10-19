// Кнопка «Послушать»: озвучивает слово голосом иврита, если он есть на устройстве

import { useEffect } from 'react';
import { speak } from '../core/speech';
import { useSpeechAvailable } from '../hooks/useSpeech';

interface SpeakButtonProps {
  text: string;
  autoPlay?: boolean;
  compact?: boolean;
}

const SpeakButton = ({ text, autoPlay = false, compact = false }: SpeakButtonProps) => {
  const available = useSpeechAvailable();

  useEffect(() => {
    if (autoPlay && available) speak(text);
  }, [autoPlay, available, text]);

  if (!available) return null;

  return (
    <button
      type="button"
      className={`btn btn-outline-primary speak-btn ${compact ? 'btn-sm' : ''}`}
      onClick={e => {
        e.stopPropagation();
        speak(text);
      }}
    >
      🔊 {compact ? '' : 'Послушать'}
    </button>
  );
};

export default SpeakButton;
