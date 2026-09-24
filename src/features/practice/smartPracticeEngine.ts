import { IDIOMS } from '@/data/idiomsRepository';
import type { Idiom } from '@/types/idiom';
import type { IdiomProgress } from '@/types/progress';
import { isDue } from '@/services/spacedRepetition';

interface QueueContext {
  progress: Record<string, IdiomProgress>;
  englishLevel?: string | null;
}

function priorityScore(idiom: Idiom, p: IdiomProgress | undefined, now: number): number {
  if (!p || p.reviewCount === 0) return 10; // new idiom, lowest priority baseline (still included)

  let score = 0;
  if (isDue(p)) score += 100;
  if (p.incorrectCount > 0 && p.correctCount <= p.incorrectCount) score += 60;
  if (p.masteryScore < 40) score += 40;
  if (p.speakingAttempts > 0 && p.speakingScoreAvg < 60) score += 30;
  const daysSinceReview = p.lastReviewed ? (now - new Date(p.lastReviewed).getTime()) / 86400000 : 999;
  score += Math.min(30, daysSinceReview);
  return score;
}

/**
 * Selects idioms to practice next, prioritizing (in order): overdue reviews,
 * recently-incorrect idioms, low mastery, poor speaking scores, idioms not
 * seen in a while, then new idioms — per the product spec's smart engine.
 */
export function buildPracticeQueue(ctx: QueueContext, count: number): Idiom[] {
  const now = Date.now();
  const levelIdioms = ctx.englishLevel
    ? IDIOMS.filter((i) => levelRank(i.level) <= levelRank(ctx.englishLevel as any) + 1)
    : IDIOMS;
  const pool = levelIdioms.length >= count * 3 ? levelIdioms : IDIOMS;

  const scored = pool.map((idiom) => ({ idiom, score: priorityScore(idiom, ctx.progress[idiom.id], now) }));
  scored.sort((a, b) => b.score - a.score + (Math.random() - 0.5) * 5);

  // Avoid pure repetition: take from the top-scored slice with some shuffling.
  const topSlice = scored.slice(0, Math.max(count * 3, count));
  const shuffled = topSlice.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((s) => s.idiom);
}

function levelRank(level: string): number {
  return ['A2', 'B1', 'B2', 'C1', 'C2'].indexOf(level);
}

export function buildNewIdiomsQueue(ctx: QueueContext, count: number): Idiom[] {
  const unseen = IDIOMS.filter((i) => !ctx.progress[i.id] || ctx.progress[i.id].reviewCount === 0);
  return unseen.slice(0, count);
}
