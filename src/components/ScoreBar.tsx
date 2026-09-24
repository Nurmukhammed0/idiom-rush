import { ProgressBar } from '@/components/ui/ProgressBar';

function colorFor(score: number): string {
  if (score >= 80) return 'var(--color-success)';
  if (score >= 50) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

export function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold" style={{ color: colorFor(score) }}>{Math.round(score)}%</span>
      </div>
      <ProgressBar value={score} color={colorFor(score)} height={8} />
    </div>
  );
}
