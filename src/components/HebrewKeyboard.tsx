// Экранная ивритская клавиатура в стандартной раскладке (SI-1452) с конечными буквами,
// гереш, пробел, стереть. Не нужно переключать раскладку телефона.

interface HebrewKeyboardProps {
  onKey: (key: string) => void;
  onBackspace: () => void;
  withSpace?: boolean;
  withGeresh?: boolean;
}

/** Ряды как на физической клавиатуре, слева направо */
const KEYBOARD_ROWS: string[][] = [
  ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
  ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'],
  ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ'],
];

const HebrewKeyboard = ({ onKey, onBackspace, withSpace = false, withGeresh = false }: HebrewKeyboardProps) => (
  // dir="ltr": порядок клавиш как на клавиатуре, а не зеркальный
  <div className="he-keyboard" dir="ltr" lang="he" role="group" aria-label="Клавиатура иврита">
    {KEYBOARD_ROWS.map(row => (
      <div key={row[0]} className="he-keyboard-row">
        {row.map(letter => (
          <button key={letter} type="button" className="he-key" onClick={() => onKey(letter)}>
            {letter}
          </button>
        ))}
      </div>
    ))}
    <div className="he-keyboard-row">
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
  </div>
);

export default HebrewKeyboard;
