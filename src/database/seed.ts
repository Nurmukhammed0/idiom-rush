// Builds a realistic pre-populated state so the app feels alive on first run (spec #42).
import { IDIOMS } from '@/data/idiomsRepository';
import { createFreshProgress, applyReview } from '@/services/spacedRepetition';
import type { DailyActivity, IdiomProgress, ReviewLogEntry, SpeakingAttempt, UserStats } from '@/types/progress';

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function dateKeyDaysAgo(days: number): string {
  return daysAgoISO(days).slice(0, 10);
}

export function buildDemoState() {
  const progress: Record<string, IdiomProgress> = {};
  const reviewLog: ReviewLogEntry[] = [];
  const speakingAttempts: SpeakingAttempt[] = [];
  const dailyActivity: Record<string, DailyActivity> = {};

  const learnedCount = 140;
  const learned = IDIOMS.slice(0, learnedCount);

  learned.forEach((idiom, idx) => {
    let p = createFreshProgress(idiom.id);
    const reviewsForThis = 1 + (idx % 5);
    for (let r = 0; r < reviewsForThis; r++) {
      const correct = Math.random() > 0.25;
      p = applyReview(p, { correct, responseTimeMs: 3000 + Math.random() * 6000 });
    }
    if (idx % 11 === 0) p.isFavorite = true;
    progress[idiom.id] = p;
  });

  // Some due-for-review idioms (force nextReview into the past)
  learned.slice(0, 12).forEach((idiom) => {
    progress[idiom.id] = { ...progress[idiom.id], nextReview: daysAgoISO(1) };
  });

  // Speaking attempts for a subset
  learned.slice(0, 24).forEach((idiom, idx) => {
    const overall = 55 + Math.round(Math.random() * 40);
    speakingAttempts.push({
      id: `${idiom.id}-demo-${idx}`,
      idiomId: idiom.id,
      mode: idx % 2 === 0 ? 'own_sentence' : 'repeat',
      transcript: `Example spoken sentence using ${idiom.idiom}.`,
      pronunciationScore: overall + Math.round(Math.random() * 10 - 5),
      grammarScore: overall + Math.round(Math.random() * 10 - 5),
      contextScore: overall + Math.round(Math.random() * 10 - 5),
      fluencyScore: overall + Math.round(Math.random() * 10 - 5),
      overallScore: overall,
      feedback: ['Good effort.'],
      timestamp: daysAgoISO(idx % 14),
    });
  });

  // Review log + daily activity for the last 14 days
  for (let d = 13; d >= 0; d--) {
    const key = dateKeyDaysAgo(d);
    const reviewsToday = d === 0 ? 8 : Math.round(Math.random() * 15);
    const idiomsLearnedToday = d === 0 ? 2 : Math.round(Math.random() * 4);
    const speakingToday = Math.round(Math.random() * 3);
    const xpToday = reviewsToday * 22 + speakingToday * 40;
    dailyActivity[key] = {
      date: key,
      xpEarned: xpToday,
      idiomsLearned: idiomsLearnedToday,
      reviewsCompleted: reviewsToday,
      speakingSessions: speakingToday,
      dailyChallengeDone: Math.random() > 0.3,
    };
    for (let i = 0; i < Math.min(reviewsToday, 20); i++) {
      const idiom = learned[Math.floor(Math.random() * learned.length)];
      reviewLog.push({
        idiomId: idiom.id,
        exerciseType: (['meaning', 'fill_gap', 'context', 'reverse_recall'] as const)[i % 4],
        correct: Math.random() > 0.22,
        responseTimeMs: 2000 + Math.random() * 8000,
        timestamp: daysAgoISO(d),
      });
    }
  }

  const totalXp = Object.values(dailyActivity).reduce((sum, d) => sum + d.xpEarned, 0);

  const stats: UserStats = {
    xp: totalXp,
    level: Math.max(1, Math.floor(Math.sqrt(totalXp / 50)) + 1),
    currentStreak: 9,
    longestStreak: 21,
    lastActiveDate: dateKeyDaysAgo(0),
    totalIdiomsLearned: learnedCount,
    dailyGoal: 10,
    englishLevel: 'B2',
    learningGoal: 'conversation',
    dailyTimeMinutes: 10,
    onboardingComplete: true,
    showTranslations: true,
    soundEnabled: true,
  };

  return {
    stats,
    progress,
    reviewLog,
    speakingAttempts,
    dailyActivity,
    unlockedAchievements: ['first_idiom', 'ten_idioms', 'streak_7'],
    newlyUnlocked: [],
  };
}
