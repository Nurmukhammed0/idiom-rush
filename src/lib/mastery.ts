import type { MasteryTier } from '@/types/idiom';
import { masteryTier } from '@/types/idiom';

export { masteryTier };

export const TIER_COLORS: Record<MasteryTier, string> = {
  NEW: '#6B7280',
  LEARNING: '#EF4444',
  FAMILIAR: '#F59E0B',
  GOOD: '#635BFF',
  MASTERED: '#22C55E',
};

export const TIER_LABELS_RU: Record<MasteryTier, string> = {
  NEW: 'Новое',
  LEARNING: 'Изучается',
  FAMILIAR: 'Знакомое',
  GOOD: 'Хорошо',
  MASTERED: 'Освоено',
};
