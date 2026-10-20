// Кнопка «Послушать»: озвучивает слово голосом иврита, если он есть на устройстве

import { useEffect } from 'react';
import { speak } from '../core/speech';
import { useSpeechAvailable } from '../hooks/useSpeech';

interface SpeakButtonProps {
  text: string;
  autoPlay?: boolean;
  compact?: boolean;
  /** Нажали «Послушать»: onEnd придёт, когда слово договорено */
  onSpeak?: () => void;
  onEnd?: () => void;
}

const SpeakButton = ({ text, autoPlay = false, compact = false, onSpeak, onEnd }: SpeakButtonProps) => {
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
        onSpeak?.();
        speak(text, onEnd);
      }}
    >
      🔊 {compact ? '' : 'Послушать'}
    </button>
  );
};

export default SpeakButton;
