// Озвучка слов через синтез речи браузера (he-IL). Работает оффлайн, если голос иврита установлен.

const isHebrewVoice = (voice: SpeechSynthesisVoice) => /^(he|iw)([-_]|$)/i.test(voice.lang);

export const speechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export const findHebrewVoice = (): SpeechSynthesisVoice | undefined =>
  speechSupported() ? window.speechSynthesis.getVoices().find(isHebrewVoice) : undefined;

/** Голоса загружаются асинхронно: ждём событие voiceschanged, но не дольше timeout */
export const waitForHebrewVoice = (timeout = 2000): Promise<boolean> => {
  if (!speechSupported()) return Promise.resolve(false);
  if (findHebrewVoice()) return Promise.resolve(true);
  return new Promise(resolve => {
    const done = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onChange);
      resolve(!!findHebrewVoice());
    };
    const onChange = () => {
      if (findHebrewVoice()) done();
    };
    window.speechSynthesis.addEventListener('voiceschanged', onChange);
    setTimeout(done, timeout);
  });
};

let current: SpeechSynthesisUtterance | null = null;

/** onEnd вызывается, когда слово договорено или озвучка прервана; без голоса — сразу */
export const speak = (text: string, onEnd?: () => void): void => {
  const voice = findHebrewVoice();
  if (!voice) {
    onEnd?.();
    return;
  }
  // Прерванное новым словом не сообщает о конце: оно уже заменено
  if (current) current.onend = current.onerror = null;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.8;   // чуть медленнее обычного — для начинающих
  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }
  current = utterance;
  window.speechSynthesis.speak(utterance);
};
