import type { ExerciseType } from '@/types/progress';

export const XP_TABLE: Record<ExerciseType, number> = {
  meaning: 20,
  fill_gap: 25,
  match: 20,
  context: 20,
  reverse_recall: 30,
  error_correction: 20,
  natural_or_not: 15,
  speaking: 40,
};

export const XP_DAILY_CHALLENGE_MIN = 100;
export const XP_DAILY_CHALLENGE_MAX = 250;
export const XP_PERFECT_BONUS = 20;
export const XP_STREAK_7_BONUS = 100;
export const XP_FIRST_SESSION_BONUS = 50;

export function xpForExercise(type: ExerciseType, correct: boolean, perfect = false): number {
  if (!correct) return 0;
  const base = XP_TABLE[type];
  return perfect ? base + XP_PERFECT_BONUS : base;
}

export function levelFromXp(xp: number): number {
  // Each level needs progressively more XP: level N requires N*200 cumulative-ish (soft curve).
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 50;
}
