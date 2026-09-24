import { masteryTier, TIER_COLORS, TIER_LABELS_RU } from '@/lib/mastery';

export function MasteryBadge({ score, showLabel = true }: { score: number; showLabel?: boolean }) {
  const tier = masteryTier(score);
  const color = TIER_COLORS[tier];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {showLabel ? `${tier} · ${TIER_LABELS_RU[tier]}` : `${score}%`}
    </span>
  );
}
