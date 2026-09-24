import { IDIOMS } from '@/data/idiomsRepository';
import type { Idiom, IdiomCategory } from '@/types/idiom';
import type { IdiomProgress } from '@/types/progress';
import { isDue } from '@/services/spacedRepetition';

interface QueueContext {
  progress: Record<string, IdiomProgress>;
  englishLevel?: string | null;
  category?: IdiomCategory;
}

function priorityScore(idiom: Idiom, p: IdiomProgress, now: number): number {
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
 * recently-incorrect idioms, low mastery, poor speaking scores, and idioms not
 * seen in a while. Only idioms the learner has already been introduced to
 * (via Learn) are eligible — Practice never tests an idiom that hasn't been
 * taught yet.
 */
export function buildPracticeQueue(ctx: QueueContext, count: number): Idiom[] {
  const now = Date.now();
  let learnedIdioms = IDIOMS.filter((i) => (ctx.progress[i.id]?.reviewCount ?? 0) > 0);
  if (ctx.category) learnedIdioms = learnedIdioms.filter((i) => i.category === ctx.category);
  const levelIdioms = ctx.englishLevel
    ? learnedIdioms.filter((i) => levelRank(i.level) <= levelRank(ctx.englishLevel as any) + 1)
    : learnedIdioms;
  const pool = levelIdioms.length >= count * 3 ? levelIdioms : learnedIdioms;

  const scored = pool.map((idiom) => ({ idiom, score: priorityScore(idiom, ctx.progress[idiom.id]!, now) }));
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
  if (!ctx.englishLevel) return unseen.slice(0, count);
  const targetRank = levelRank(ctx.englishLevel as any);
  const sorted = [...unseen].sort((a, b) => Math.abs(levelRank(a.level) - targetRank) - Math.abs(levelRank(b.level) - targetRank));
  return sorted.slice(0, count);
}
