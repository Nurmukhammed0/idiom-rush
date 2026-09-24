import type { Achievement, AchievementContext } from '@/types/progress';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_idiom',
    title: 'First Idiom',
    description: "You've started your journey.",
    icon: '🌱',
    check: (ctx) => ctx.stats.totalIdiomsLearned >= 1,
  },
  {
    id: 'ten_idioms',
    title: '10 Idioms',
    description: "You're building real momentum.",
    icon: '📘',
    check: (ctx) => ctx.stats.totalIdiomsLearned >= 10,
  },
  {
    id: 'hundred_idioms',
    title: '100 Idioms',
    description: 'A serious vocabulary is taking shape.',
    icon: '📚',
    check: (ctx) => ctx.stats.totalIdiomsLearned >= 100,
  },
  {
    id: 'idiom_master',
    title: 'Idiom Master',
    description: "Fifty idioms have truly stuck with you.",
    icon: '🏆',
    check: (ctx) => Object.values(ctx.progress).filter((p) => p.masteryScore >= 80).length >= 50,
  },
  {
    id: 'speaking_star',
    title: 'Speaking Star',
    description: 'Your voice is becoming part of how you learn.',
    icon: '🎤',
    check: (ctx) => ctx.speakingAttempts.length >= 20,
  },
  {
    id: 'perfect_day',
    title: 'Perfect Day',
    description: 'A flawless day of practice.',
    icon: '💯',
    check: (ctx) => Object.values(ctx.dailyActivity).some((d) => d.dailyChallengeDone && d.reviewsCompleted >= 10),
  },
  {
    id: 'streak_7',
    title: '7 Day Streak',
    description: "A full week without missing a day.",
    icon: '🔥',
    check: (ctx) => ctx.stats.longestStreak >= 7,
  },
  {
    id: 'streak_30',
    title: '30 Day Streak',
    description: "A month of daily practice — real habit territory.",
    icon: '🔥',
    check: (ctx) => ctx.stats.longestStreak >= 30,
  },
  {
    id: 'streak_100',
    title: '100 Day Streak',
    description: 'One hundred days. This is who you are now.',
    icon: '🔥',
    check: (ctx) => ctx.stats.longestStreak >= 100,
  },
  {
    id: 'context_master',
    title: 'Context Master',
    description: "You read situations and know the right idiom.",
    icon: '🧩',
    check: (ctx) => ctx.reviewLog.filter((r) => r.exerciseType === 'context' && r.correct).length >= 100,
  },
  {
    id: 'recall_master',
    title: 'Recall Master',
    description: 'From meaning to idiom, instantly.',
    icon: '🧠',
    check: (ctx) => ctx.reviewLog.filter((r) => r.exerciseType === 'reverse_recall' && r.correct).length >= 100,
  },
];

export function computeUnlockedAchievements(ctx: AchievementContext): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(ctx)).map((a) => a.id);
}
