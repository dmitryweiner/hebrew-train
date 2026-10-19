// Экранная ивритская клавиатура: 22 буквы по алфавиту, гереш, пробел, стереть.
// Не нужно переключать раскладку телефона — главный барьер для пожилых пользователей.

import { getHebrewAlphabet } from '../utils/hebrewUtils';

interface HebrewKeyboardProps {
  onKey: (key: string) => void;
  onBackspace: () => void;
  withSpace?: boolean;
  withGeresh?: boolean;
}

const HebrewKeyboard = ({ onKey, onBackspace, withSpace = false, withGeresh = false }: HebrewKeyboardProps) => (
  <div className="he-keyboard" dir="rtl" lang="he" role="group" aria-label="Клавиатура иврита">
    {getHebrewAlphabet().map(letter => (
      <button key={letter} type="button" className="he-key" onClick={() => onKey(letter)}>
        {letter}
      </button>
    ))}
    {withGeresh && (
      <button type="button" className="he-key" onClick={() => onKey('׳')} aria-label="гереш">
        ׳
      </button>
    )}
    {withSpace && (
      <button type="button" className="he-key he-key-wide" onClick={() => onKey(' ')}>
        пробел
      </button>
    )}
    <button type="button" className="he-key he-key-wide he-key-back" onClick={onBackspace} aria-label="Стереть букву">
      ⌫ стереть
    </button>
  </div>
);

export default HebrewKeyboard;
