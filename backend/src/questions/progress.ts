export type ChapterStatus = 'NOT_STARTED' | 'LEARNING' | 'REVISING' | 'MASTERED';

export const PROGRESS_THRESHOLDS = {
  revisingAttempts: 10,
  masteryAttempts: 15,
  masteryAccuracy: 0.8,
};

const RANK: Record<ChapterStatus, number> = {
  NOT_STARTED: 0,
  LEARNING: 1,
  REVISING: 2,
  MASTERED: 3,
};

export function nextStatus(
  current: ChapterStatus,
  stats: { attempted: number; correct: number }
): ChapterStatus {
  const { attempted, correct } = stats;
  const accuracy = attempted > 0 ? correct / attempted : 0;

  let computed: ChapterStatus = 'NOT_STARTED';
  if (attempted >= 1) computed = 'LEARNING';
  if (attempted >= PROGRESS_THRESHOLDS.revisingAttempts) computed = 'REVISING';
  if (attempted >= PROGRESS_THRESHOLDS.masteryAttempts && accuracy >= PROGRESS_THRESHOLDS.masteryAccuracy) {
    computed = 'MASTERED';
  }

  // Never regress.
  return RANK[computed] >= RANK[current] ? computed : current;
}
