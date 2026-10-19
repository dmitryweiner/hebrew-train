// Календарь активности за 12 недель (как в GitHub): строки — дни недели, столбцы — недели

import type { DayStats } from '../core/progress';
import { addDays, parseDay, type Day } from '../core/dates';

interface ActivityCalendarProps {
  days: Record<Day, DayStats>;
  today: Day;
  weeks?: number;
}

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

const levelOf = (stats: DayStats | undefined): number => {
  if (!stats || stats.rounds === 0) return 0;
  if (stats.daily) return stats.rounds >= 3 ? 3 : 2;
  return 1;
};

const ActivityCalendar = ({ days, today, weeks = 12 }: ActivityCalendarProps) => {
  // Последний столбец — текущая неделя, начинаем с понедельника
  const weekday = (parseDay(today).getDay() + 6) % 7;
  const start = addDays(today, -weekday - (weeks - 1) * 7);
  const columns = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d))
  );

  return (
    <div className="calendar" role="img" aria-label="Календарь занятий за 12 недель">
      <div className="calendar-weekdays" aria-hidden>
        {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="calendar-grid">
        {columns.map(column => (
          <div key={column[0]} className="calendar-col">
            {column.map(day => (
              <span
                key={day}
                className={`calendar-cell level-${day > today ? 'future' : levelOf(days[day])} ${day === today ? 'is-today' : ''}`}
                title={`${parseDay(day).toLocaleDateString('ru-RU')}: ${days[day]?.rounds ?? 0} раундов`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="calendar-legend" aria-hidden>
        <span className="calendar-cell level-0" /> нет
        <span className="calendar-cell level-1" /> занимались
        <span className="calendar-cell level-2" /> тренировка дня
      </div>
    </div>
  );
};

export default ActivityCalendar;
