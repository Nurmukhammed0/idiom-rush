import type { IdiomProgress } from '@/types/progress';

// Interval ladder in days, following the product spec's spaced-repetition schedule.
const INTERVAL_LADDER = [1, 3, 7, 14, 30, 60];

export function nextIntervalOnCorrect(currentIntervalDays: number): number {
  const idx = INTERVAL_LADDER.indexOf(currentIntervalDays);
  if (idx === -1) return INTERVAL_LADDER[0];
  return INTERVAL_LADDER[Math.min(idx + 1, INTERVAL_LADDER.length - 1)];
}

export function nextIntervalOnIncorrect(currentIntervalDays: number): number {
  // Drop back two rungs (minimum 1 day) so forgotten idioms resurface sooner.
  const idx = INTERVAL_LADDER.indexOf(currentIntervalDays);
  if (idx <= 0) return INTERVAL_LADDER[0];
  return INTERVAL_LADDER[Math.max(0, idx - 2)];
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export interface ReviewOutcome {
  correct: boolean;
  responseTimeMs: number;
  speakingScore?: number;
}

const FAST_RESPONSE_MS = 4000;
const SLOW_RESPONSE_MS = 15000;

export function applyReview(progress: IdiomProgress, outcome: ReviewOutcome): IdiomProgress {
  const now = new Date();
  const isNew = progress.reviewCount === 0;

  let intervalDays: number;
  if (outcome.correct) {
    intervalDays = isNew ? 1 : nextIntervalOnCorrect(progress.intervalDays);
  } else {
    intervalDays = nextIntervalOnIncorrect(progress.intervalDays);
  }

  // Confidence adjustment: fast correct answers earn a small mastery bonus,
  // slow or hesitant ones a smaller bump, incorrect answers a penalty.
  let masteryDelta: number;
  if (outcome.correct) {
    masteryDelta = outcome.responseTimeMs <= FAST_RESPONSE_MS ? 12 : outcome.responseTimeMs >= SLOW_RESPONSE_MS ? 6 : 9;
    if (typeof outcome.speakingScore === 'number') {
      masteryDelta = Math.round((masteryDelta + outcome.speakingScore / 10) / 2);
    }
  } else {
    masteryDelta = -15;
  }

  const masteryScore = Math.max(0, Math.min(100, progress.masteryScore + masteryDelta));

  return {
    ...progress,
    masteryScore,
    reviewCount: progress.reviewCount + 1,
    correctCount: progress.correctCount + (outcome.correct ? 1 : 0),
    incorrectCount: progress.incorrectCount + (outcome.correct ? 0 : 1),
    intervalDays,
    lastReviewed: now.toISOString(),
    nextReview: addDays(now, intervalDays).toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function isDue(progress: IdiomProgress): boolean {
  if (!progress.nextReview) return true;
  return new Date(progress.nextReview).getTime() <= Date.now();
}

export function createFreshProgress(idiomId: string): IdiomProgress {
  const now = new Date().toISOString();
  return {
    idiomId,
    masteryScore: 0,
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    speakingAttempts: 0,
    speakingScoreAvg: 0,
    lastReviewed: null,
    nextReview: null,
    intervalDays: 0,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
}
