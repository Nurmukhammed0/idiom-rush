import type { Idiom } from '@/types/idiom';

export interface ExerciseProps {
  idiom: Idiom;
  onAnswer: (correct: boolean, responseTimeMs: number) => void;
}
