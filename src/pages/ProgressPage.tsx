// Страница «Прогресс»: календарь, категории, трудные слова, все слова, резервная копия

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import type { Word } from '../types';
import { BOX_LABELS, visibleStreak } from '../core/progress';
import { WORDS } from '../data/dictionary';
import { CATEGORY_NAMES, getCategoryName } from '../data/categories';
import { useProgress } from '../state/progressContext';
import { pluralRu } from '../utils/plural';
import PageHeader from '../components/PageHeader';
import ActivityCalendar from '../components/ActivityCalendar';
import WordDialog from '../components/WordDialog';
import WordImage from '../components/WordImage';
import HebrewText from '../components/HebrewText';
import BackupCard from '../pwa/BackupCard';

const HARD_WORDS_LIMIT = 10;

const ProgressPage = () => {
  const { progress, today } = useProgress();
  const [category, setCategory] = useState<string>('all');
  const [openWord, setOpenWord] = useState<Word | null>(null);
  const boxOf = (id: string) => progress.words[id]?.box ?? 0;

  const categories = useMemo(() => Object.keys(CATEGORY_NAMES).map(key => {
    const words = WORDS.filter(w => w.category === key);
    return {
      key,
      total: words.length,
      learned: words.filter(w => boxOf(w.id) >= 4).length,
      learning: words.filter(w => boxOf(w.id) >= 1 && boxOf(w.id) <= 3).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }).filter(c => c.total > 0), [progress.words]);

  const hardWords = useMemo(() => WORDS
    .filter(w => (progress.words[w.id]?.wrong ?? 0) > 0)
    .sort((a, b) => {
      const pa = progress.words[a.id], pb = progress.words[b.id];
      return pb.wrong - pa.wrong || pb.wrong / pb.seen - pa.wrong / pa.seen;
    })
    .slice(0, HARD_WORDS_LIMIT), [progress.words]);

  const listed = category === 'all' ? WORDS : WORDS.filter(w => w.category === category);
  const streak = visibleStreak(progress.streak, today);
  const daysActive = Object.values(progress.days).filter(d => d.rounds > 0).length;

  return (
    <div className="page">
      <PageHeader title="Прогресс" />

      <section className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-around text-center mb-3">
            <div><div className="vocab-num">🔥 {streak}</div><div className="small text-muted">{pluralRu(streak, 'день', 'дня', 'дней')} подряд</div></div>
            <div><div className="vocab-num">{progress.streak.best}</div><div className="small text-muted">лучшая серия</div></div>
            <div><div className="vocab-num">{daysActive}</div><div className="small text-muted">{pluralRu(daysActive, 'день', 'дня', 'дней')} занятий</div></div>
          </div>
          <ActivityCalendar days={progress.days} today={today} />
        </div>
      </section>

      <h2 className="section-title">По темам</h2>
      <section className="card shadow-sm mb-3">
        <div className="card-body">
          {categories.map(c => (
            <div key={c.key} className="category-row">
              <div className="d-flex justify-content-between">
                <span>{getCategoryName(c.key)}</span>
                <span className="text-muted">выучено {c.learned} из {c.total}</span>
              </div>
              <div className="category-bar" aria-hidden>
                <span className="is-learned" style={{ width: `${(c.learned / c.total) * 100}%` }} />
                <span className="is-learning" style={{ width: `${(c.learning / c.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {hardWords.length > 0 && (
        <>
          <h2 className="section-title">Трудные слова</h2>
          <section className="card shadow-sm mb-3">
            <div className="card-body">
              <ul className="word-list">
                {hardWords.map(w => (
                  <li key={w.id}>
                    <button className="word-row" onClick={() => setOpenWord(w)}>
                      <WordImage emoji={w.emoji} picture={w.picture} alt={w.russian} size="small" />
                      <span className="word-row-text">
                        <HebrewText size="sm">{w.hebrew}</HebrewText>
                        <span className="text-muted small">{w.russian}</span>
                      </span>
                      <span className="text-danger small">ошибок: {progress.words[w.id].wrong}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <Link
                to={`/play/word-choice?words=${hardWords.map(w => w.id).join(',')}`}
                className="btn btn-warning btn-lg w-100 mt-2"
              >
                🔁 Повторить эти слова
              </Link>
            </div>
          </section>
        </>
      )}

      <h2 className="section-title">Все слова</h2>
      <select
        className="form-select form-select-lg mb-2"
        value={category}
        onChange={e => setCategory(e.target.value)}
        aria-label="Тема"
      >
        <option value="all">Все темы ({WORDS.length})</option>
        {categories.map(c => (
          <option key={c.key} value={c.key}>{getCategoryName(c.key)} ({c.total})</option>
        ))}
      </select>
      <ul className="word-list card shadow-sm mb-3">
        {listed.map(w => (
          <li key={w.id}>
            <button className="word-row" onClick={() => setOpenWord(w)}>
              <WordImage emoji={w.emoji} picture={w.picture} alt={w.russian} size="small" />
              <span className="word-row-text">
                <HebrewText size="sm">{w.hebrew}</HebrewText>
                <span className="text-muted small">{w.russian}</span>
              </span>
              <span className={`box-badge box-${boxOf(w.id)}`}>{BOX_LABELS[boxOf(w.id)]}</span>
            </button>
          </li>
        ))}
      </ul>

      <BackupCard />

      {openWord && <WordDialog word={openWord} progress={progress.words[openWord.id]} onClose={() => setOpenWord(null)} />}
    </div>
  );
};

export default ProgressPage;
