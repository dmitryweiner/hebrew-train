// Карточка «Мой словарь»: выучено / учу / новых + кольцевая диаграмма

import type { VocabularySummary } from '../core/progress';

interface VocabularyCardProps {
  summary: VocabularySummary;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const VocabularyCard = ({ summary }: VocabularyCardProps) => {
  const total = summary.learned + summary.learning + summary.fresh;
  const learnedLen = total ? (summary.learned / total) * CIRCUMFERENCE : 0;
  const learningLen = total ? (summary.learning / total) * CIRCUMFERENCE : 0;

  return (
    <section className="card shadow-sm vocab-card" aria-label="Мой словарь">
      <div className="card-body d-flex align-items-center gap-3">
        <svg className="vocab-ring" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r={RADIUS} className="ring-track" />
          <circle
            cx="50" cy="50" r={RADIUS} className="ring-learning"
            strokeDasharray={`${learnedLen + learningLen} ${CIRCUMFERENCE}`}
          />
          <circle
            cx="50" cy="50" r={RADIUS} className="ring-learned"
            strokeDasharray={`${learnedLen} ${CIRCUMFERENCE}`}
          />
          <text x="50" y="50" className="ring-label" textAnchor="middle" dominantBaseline="central">
            {total ? Math.round((summary.learned / total) * 100) : 0}%
          </text>
        </svg>
        <div className="flex-grow-1">
          <div className="fw-bold mb-1">Мой словарь</div>
          <div className="vocab-numbers">
            <div><span className="vocab-num text-success">{summary.learned}</span><span>выучено</span></div>
            <div><span className="vocab-num text-primary">{summary.learning}</span><span>учу</span></div>
            <div><span className="vocab-num text-secondary">{summary.fresh}</span><span>новых</span></div>
          </div>
          {summary.due > 0 && <div className="small text-muted mt-1">Пора повторить: {summary.due}</div>}
        </div>
      </div>
    </section>
  );
};

export default VocabularyCard;
