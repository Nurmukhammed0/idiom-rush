import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IDIOMS, IDIOM_BY_ID } from '@/data/idiomsRepository';
import type { Idiom } from '@/types/idiom';
import { masteryTier } from '@/types/idiom';
import type {
  DailyActivity,
  ExerciseType,
  IdiomProgress,
  ReviewLogEntry,
  SpeakingAttempt,
  UserStats,
} from '@/types/progress';
import { applyReview, createFreshProgress, isDue } from '@/services/spacedRepetition';
import { xpForExercise, XP_STREAK_7_BONUS, XP_FIRST_SESSION_BONUS } from '@/services/xp';
import { computeUnlockedAchievements } from '@/services/achievements';
import type { SpeakingScores } from '@/services/speakingEvaluation';

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function isYesterday(dateStr: string): boolean {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return todayKey(y) === dateStr;
}

const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  totalIdiomsLearned: 0,
  dailyGoal: 10,
  englishLevel: null,
  learningGoal: null,
  dailyTimeMinutes: null,
  onboardingComplete: false,
  showTranslations: true,
  soundEnabled: true,
};

interface AppState {
  stats: UserStats;
  progress: Record<string, IdiomProgress>;
  reviewLog: ReviewLogEntry[];
  speakingAttempts: SpeakingAttempt[];
  dailyActivity: Record<string, DailyActivity>;
  unlockedAchievements: string[];
  newlyUnlocked: string[];

  // derived helpers
  getProgress: (idiomId: string) => IdiomProgress;
  getDueIdioms: () => Idiom[];
  getFavorites: () => Idiom[];
  getMasteredCount: () => number;
  getLearningCount: () => number;
  getTodayActivity: () => DailyActivity;
  getWeeklyActivity: () => DailyActivity[];
  getWeakCategories: () => { category: string; accuracy: number }[];

  // actions
  touchStreak: () => void;
  recordReview: (idiomId: string, exerciseType: ExerciseType, correct: boolean, responseTimeMs: number, perfect?: boolean) => void;
  recordSpeakingAttempt: (idiomId: string, mode: SpeakingAttempt['mode'], transcript: string, scores: SpeakingScores) => void;
  toggleFavorite: (idiomId: string) => void;
  completeOnboarding: (level: UserStats['englishLevel'], goal: UserStats['learningGoal'], minutes: UserStats['dailyTimeMinutes']) => void;
  setDailyGoal: (goal: number) => void;
  setShowTranslations: (show: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  addXp: (amount: number) => void;
  clearNewlyUnlocked: () => void;
  resetAllData: () => void;
  loadDemoData: () => void;
}

function recalcAchievements(get: () => AppState, set: (partial: Partial<AppState>) => void) {
  const s = get();
  const unlocked = computeUnlockedAchievements({
    stats: s.stats,
    progress: s.progress,
    reviewLog: s.reviewLog,
    speakingAttempts: s.speakingAttempts,
    dailyActivity: s.dailyActivity,
  });
  const newOnes = unlocked.filter((id) => !s.unlockedAchievements.includes(id));
  if (newOnes.length) {
    set({ unlockedAchievements: unlocked, newlyUnlocked: [...s.newlyUnlocked, ...newOnes] });
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      stats: DEFAULT_STATS,
      progress: {},
      reviewLog: [],
      speakingAttempts: [],
      dailyActivity: {},
      unlockedAchievements: [],
      newlyUnlocked: [],

      getProgress: (idiomId) => get().progress[idiomId] ?? createFreshProgress(idiomId),

      getDueIdioms: () => {
        const s = get();
        return IDIOMS.filter((idiom) => {
          const p = s.progress[idiom.id];
          return p ? isDue(p) : false;
        });
      },

      getFavorites: () => {
        const s = get();
        return IDIOMS.filter((idiom) => s.progress[idiom.id]?.isFavorite);
      },

      getMasteredCount: () => Object.values(get().progress).filter((p) => p.masteryScore >= 80).length,
      getLearningCount: () => Object.values(get().progress).filter((p) => p.masteryScore > 0 && p.masteryScore < 80).length,

      getTodayActivity: () => {
        const key = todayKey();
        return get().dailyActivity[key] ?? { date: key, xpEarned: 0, idiomsLearned: 0, reviewsCompleted: 0, speakingSessions: 0, dailyChallengeDone: false };
      },

      getWeeklyActivity: () => {
        const out: DailyActivity[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = todayKey(d);
          out.push(get().dailyActivity[key] ?? { date: key, xpEarned: 0, idiomsLearned: 0, reviewsCompleted: 0, speakingSessions: 0, dailyChallengeDone: false });
        }
        return out;
      },

      getWeakCategories: () => {
        const s = get();
        const byCategory: Record<string, { correct: number; total: number }> = {};
        for (const log of s.reviewLog) {
          const idiom = IDIOM_BY_ID[log.idiomId];
          if (!idiom) continue;
          const bucket = (byCategory[idiom.category] ??= { correct: 0, total: 0 });
          bucket.total += 1;
          if (log.correct) bucket.correct += 1;
        }
        return Object.entries(byCategory)
          .filter(([, v]) => v.total >= 3)
          .map(([category, v]) => ({ category, accuracy: Math.round((v.correct / v.total) * 100) }))
          .sort((a, b) => a.accuracy - b.accuracy);
      },

      touchStreak: () => {
        const s = get();
        const today = todayKey();
        if (s.stats.lastActiveDate === today) return;
        const continuesStreak = s.stats.lastActiveDate ? isYesterday(s.stats.lastActiveDate) : false;
        const currentStreak = continuesStreak ? s.stats.currentStreak + 1 : 1;
        const longestStreak = Math.max(s.stats.longestStreak, currentStreak);
        const bonus = currentStreak > 0 && currentStreak % 7 === 0 ? XP_STREAK_7_BONUS : 0;
        set({
          stats: { ...s.stats, currentStreak, longestStreak, lastActiveDate: today, xp: s.stats.xp + bonus },
        });
        recalcAchievements(get, set);
      },

      addXp: (amount) => {
        const s = get();
        set({ stats: { ...s.stats, xp: s.stats.xp + amount } });
      },

      recordReview: (idiomId, exerciseType, correct, responseTimeMs, perfect = false) => {
        const s = get();
        get().touchStreak();
        const existing = s.progress[idiomId] ?? createFreshProgress(idiomId);
        const wasNew = existing.reviewCount === 0;
        const updated = applyReview(existing, { correct, responseTimeMs });
        const xpGain = xpForExercise(exerciseType, correct, perfect) + (s.stats.xp === 0 && wasNew ? XP_FIRST_SESSION_BONUS : 0);

        const today = todayKey();
        const activity = s.dailyActivity[today] ?? { date: today, xpEarned: 0, idiomsLearned: 0, reviewsCompleted: 0, speakingSessions: 0, dailyChallengeDone: false };

        set((state) => ({
          progress: { ...state.progress, [idiomId]: updated },
          reviewLog: [...state.reviewLog, { idiomId, exerciseType, correct, responseTimeMs, timestamp: new Date().toISOString() }],
          stats: {
            ...state.stats,
            xp: state.stats.xp + xpGain,
            totalIdiomsLearned: wasNew ? state.stats.totalIdiomsLearned + 1 : state.stats.totalIdiomsLearned,
          },
          dailyActivity: {
            ...state.dailyActivity,
            [today]: {
              ...activity,
              xpEarned: activity.xpEarned + xpGain,
              idiomsLearned: activity.idiomsLearned + (wasNew ? 1 : 0),
              reviewsCompleted: activity.reviewsCompleted + 1,
              dailyChallengeDone: activity.reviewsCompleted + 1 >= 10 ? true : activity.dailyChallengeDone,
            },
          },
        }));
        recalcAchievements(get, set);
      },

      recordSpeakingAttempt: (idiomId, mode, transcript, scores) => {
        get().touchStreak();
        const s = get();
        const existing = s.progress[idiomId] ?? createFreshProgress(idiomId);
        const updated = applyReview(existing, { correct: scores.overall >= 60, responseTimeMs: 5000, speakingScore: scores.overall });
        const newSpeakingCount = existing.speakingAttempts + 1;
        const newAvg = Math.round((existing.speakingScoreAvg * existing.speakingAttempts + scores.overall) / newSpeakingCount);
        const xpGain = xpForExercise('speaking', true, scores.overall >= 90);

        const today = todayKey();
        const activity = s.dailyActivity[today] ?? { date: today, xpEarned: 0, idiomsLearned: 0, reviewsCompleted: 0, speakingSessions: 0, dailyChallengeDone: false };

        const attempt: SpeakingAttempt = {
          id: `${idiomId}-${Date.now()}`,
          idiomId,
          mode,
          transcript,
          pronunciationScore: scores.pronunciation,
          grammarScore: scores.grammar,
          contextScore: scores.context,
          fluencyScore: scores.fluency,
          overallScore: scores.overall,
          feedback: scores.feedback,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          progress: { ...state.progress, [idiomId]: { ...updated, speakingAttempts: newSpeakingCount, speakingScoreAvg: newAvg } },
          speakingAttempts: [...state.speakingAttempts, attempt],
          stats: { ...state.stats, xp: state.stats.xp + xpGain },
          dailyActivity: { ...state.dailyActivity, [today]: { ...activity, xpEarned: activity.xpEarned + xpGain, speakingSessions: activity.speakingSessions + 1 } },
        }));
        recalcAchievements(get, set);
      },

      toggleFavorite: (idiomId) => {
        const s = get();
        const existing = s.progress[idiomId] ?? createFreshProgress(idiomId);
        set({ progress: { ...s.progress, [idiomId]: { ...existing, isFavorite: !existing.isFavorite } } });
      },

      completeOnboarding: (level, goal, minutes) => {
        const s = get();
        const goalMap = { 5: 5, 10: 10, 20: 15, 30: 20 } as const;
        set({
          stats: {
            ...s.stats,
            englishLevel: level,
            learningGoal: goal,
            dailyTimeMinutes: minutes,
            dailyGoal: minutes ? goalMap[minutes] : 10,
            onboardingComplete: true,
          },
        });
      },

      setDailyGoal: (goal) => set((s) => ({ stats: { ...s.stats, dailyGoal: goal } })),
      setShowTranslations: (show) => set((s) => ({ stats: { ...s.stats, showTranslations: show } })),
      setSoundEnabled: (enabled) => set((s) => ({ stats: { ...s.stats, soundEnabled: enabled } })),
      clearNewlyUnlocked: () => set({ newlyUnlocked: [] }),

      resetAllData: () =>
        set({
          stats: DEFAULT_STATS,
          progress: {},
          reviewLog: [],
          speakingAttempts: [],
          dailyActivity: {},
          unlockedAchievements: [],
          newlyUnlocked: [],
        }),

      loadDemoData: () => {
        import('@/database/seed').then(({ buildDemoState }) => {
          set(buildDemoState());
        });
      },
    }),
    { name: 'idiom-rush-state', version: 1 }
  )
);
