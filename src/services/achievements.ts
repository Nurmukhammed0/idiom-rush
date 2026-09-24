import type { Achievement, AchievementContext } from '@/types/progress';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_idiom',
    title: 'First Idiom',
    description: 'Learn your first idiom.',
    icon: '🌱',
    check: (ctx) => ctx.stats.totalIdiomsLearned >= 1,
  },
  {
    id: 'ten_idioms',
    title: '10 Idioms',
    description: 'Learn 10 idioms.',
    icon: '📘',
    check: (ctx) => ctx.stats.totalIdiomsLearned >= 10,
  },
  {
    id: 'hundred_idioms',
    title: '100 Idioms',
    description: 'Learn 100 idioms.',
    icon: '📚',
    check: (ctx) => ctx.stats.totalIdiomsLearned >= 100,
  },
  {
    id: 'idiom_master',
    title: 'Idiom Master',
    description: 'Master 50 idioms.',
    icon: '🏆',
    check: (ctx) => Object.values(ctx.progress).filter((p) => p.masteryScore >= 80).length >= 50,
  },
  {
    id: 'speaking_star',
    title: 'Speaking Star',
    description: 'Complete 20 speaking exercises.',
    icon: '🎤',
    check: (ctx) => ctx.speakingAttempts.length >= 20,
  },
  {
    id: 'perfect_day',
    title: 'Perfect Day',
    description: 'Score 100% on a daily challenge.',
    icon: '💯',
    check: (ctx) => Object.values(ctx.dailyActivity).some((d) => d.dailyChallengeDone && d.reviewsCompleted >= 10),
  },
  {
    id: 'streak_7',
    title: '7 Day Streak',
    description: 'Practice 7 days in a row.',
    icon: '🔥',
    check: (ctx) => ctx.stats.longestStreak >= 7,
  },
  {
    id: 'streak_30',
    title: '30 Day Streak',
    description: 'Practice 30 days in a row.',
    icon: '🔥',
    check: (ctx) => ctx.stats.longestStreak >= 30,
  },
  {
    id: 'streak_100',
    title: '100 Day Streak',
    description: 'Practice 100 days in a row.',
    icon: '🔥',
    check: (ctx) => ctx.stats.longestStreak >= 100,
  },
  {
    id: 'context_master',
    title: 'Context Master',
    description: 'Complete 100 context questions.',
    icon: '🧩',
    check: (ctx) => ctx.reviewLog.filter((r) => r.exerciseType === 'context' && r.correct).length >= 100,
  },
  {
    id: 'recall_master',
    title: 'Recall Master',
    description: 'Complete 100 reverse recall questions.',
    icon: '🧠',
    check: (ctx) => ctx.reviewLog.filter((r) => r.exerciseType === 'reverse_recall' && r.correct).length >= 100,
  },
];

export function computeUnlockedAchievements(ctx: AchievementContext): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(ctx)).map((a) => a.id);
}
