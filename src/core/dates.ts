// Работа с датами в формате "YYYY-MM-DD" по местному времени пользователя

export type Day = string;

export const toDay = (date: Date = new Date()): Day => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseDay = (day: Day): Date => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (day: Day, days: number): Day => {
  const date = parseDay(day);
  date.setDate(date.getDate() + days);
  return toDay(date);
};

/** Количество дней от a до b (b - a) */
export const daysBetween = (a: Day, b: Day): number =>
  Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86_400_000);
