export interface IdiomProgress {
  idiomId: string;
  masteryScore: number; // 0-100
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  speakingAttempts: number;
  speakingScoreAvg: number;
  lastReviewed: string | null; // ISO date
  nextReview: string | null; // ISO date
  intervalDays: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExerciseType =
  | 'meaning'
  | 'fill_gap'
  | 'match'
  | 'context'
  | 'reverse_recall'
  | 'error_correction'
  | 'natural_or_not'
  | 'speaking';

export interface ReviewLogEntry {
  idiomId: string;
  exerciseType: ExerciseType;
  correct: boolean;
  responseTimeMs: number;
  timestamp: string;
}

export interface SpeakingAttempt {
  id: string;
  idiomId: string;
  mode: 'repeat' | 'complete' | 'own_sentence' | 'situation' | 'conversation';
  transcript: string;
  pronunciationScore: number;
  grammarScore: number;
  contextScore: number;
  fluencyScore: number;
  overallScore: number;
  feedback: string[];
  timestamp: string;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  xpEarned: number;
  idiomsLearned: number;
  reviewsCompleted: number;
  speakingSessions: number;
  dailyChallengeDone: boolean;
}

export interface UserStats {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalIdiomsLearned: number;
  dailyGoal: number; // idioms per day
  englishLevel: 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  learningGoal: 'conversation' | 'ielts' | 'work' | 'university' | 'general' | null;
  dailyTimeMinutes: 5 | 10 | 20 | 30 | null;
  onboardingComplete: boolean;
  showTranslations: boolean;
  soundEnabled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  stats: UserStats;
  progress: Record<string, IdiomProgress>;
  reviewLog: ReviewLogEntry[];
  speakingAttempts: SpeakingAttempt[];
  dailyActivity: Record<string, DailyActivity>;
}
