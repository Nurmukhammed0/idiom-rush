import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Idiom } from '@/types/idiom';

interface MatchGameProps {
  idioms: Idiom[];
  onComplete: (results: { idiomId: string; correct: boolean }[]) => void;
}

export function MatchGame({ idioms, onComplete }: MatchGameProps) {
  const meanings = useMemo(() => [...idioms].sort(() => Math.random() - 0.5), [idioms]);
  const leftItems = useMemo(() => [...idioms].sort(() => Math.random() - 0.5), [idioms]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [wrongFlash, setWrongFlash] = useState<{ left: string; right: string } | null>(null);
  const [results, setResults] = useState<{ idiomId: string; correct: boolean }[]>([]);

  function pickLeft(id: string) {
    if (matched[id]) return;
    setSelectedLeft(id);
  }

  function pickRight(idiom: Idiom) {
    if (!selectedLeft || matched[selectedLeft]) return;
    const isCorrect = selectedLeft === idiom.id;
    if (isCorrect) {
      const newMatched = { ...matched, [selectedLeft]: true };
      setMatched(newMatched);
      const newResults = [...results, { idiomId: selectedLeft, correct: true }];
      setResults(newResults);
      setSelectedLeft(null);
      if (Object.keys(newMatched).length === idioms.length) {
        setTimeout(() => onComplete(newResults), 500);
      }
    } else {
      setWrongFlash({ left: selectedLeft, right: idiom.id });
      setTimeout(() => setWrongFlash(null), 500);
      setResults((r) => [...r, { idiomId: selectedLeft, correct: false }]);
      setSelectedLeft(null);
    }
  }

  return (
    <Card className="p-6">
      <div className="text-xs font-bold uppercase text-gray-400 mb-4">Найдите пары: идиома ↔ значение</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {leftItems.map((idiom) => (
            <button
              key={idiom.id}
              onClick={() => pickLeft(idiom.id)}
              disabled={matched[idiom.id]}
              className={`focus-ring w-full text-left p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-tight transition-colors ${
                matched[idiom.id]
                  ? 'border-[var(--color-success)] bg-[var(--color-success-light)] opacity-60'
                  : selectedLeft === idiom.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                  : wrongFlash?.left === idiom.id
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {matched[idiom.id] && <Check size={12} className="inline mr-1" />}
              {idiom.idiom}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {meanings.map((idiom) => (
            <button
              key={idiom.id}
              onClick={() => pickRight(idiom)}
              disabled={matched[idiom.id]}
              className={`focus-ring w-full text-left p-3 rounded-xl border-2 text-xs transition-colors ${
                matched[idiom.id]
                  ? 'border-[var(--color-success)] bg-[var(--color-success-light)] opacity-60'
                  : wrongFlash?.right === idiom.id
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {idiom.meaning_en}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
