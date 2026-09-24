import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SpeakingChallenge } from '@/features/speaking/SpeakingChallenge';
import { MODE_LABELS, type SpeakingMode } from '@/features/speaking/prompts';
import { IDIOM_BY_ID, getRandomIdioms } from '@/data/idiomsRepository';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';

const MODES: SpeakingMode[] = ['repeat', 'complete', 'own_sentence', 'situation', 'conversation'];

export default function Speaking() {
  const [params] = useSearchParams();
  const forcedIdiomId = params.get('idiom');
  const progress = useAppStore((s) => s.progress);
  const getDueIdioms = useAppStore((s) => s.getDueIdioms);
  const [mode, setMode] = useState<SpeakingMode>('own_sentence');
  const [refreshKey, setRefreshKey] = useState(0);

  const idiom = useMemo(() => {
    if (forcedIdiomId && IDIOM_BY_ID[forcedIdiomId]) return IDIOM_BY_ID[forcedIdiomId];
    const due = getDueIdioms();
    if (due.length > 0) return due[Math.floor(Math.random() * due.length)];
    const learned = Object.keys(progress);
    if (learned.length > 0) return IDIOM_BY_ID[learned[Math.floor(Math.random() * learned.length)]];
    return getRandomIdioms(1)[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedIdiomId, refreshKey]);

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Speaking Practice</h1>
        <p className="text-gray-500 text-sm mt-1">Говорите вслух — активное использование закрепляет идиомы лучше всего.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`focus-ring px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${
              mode === m ? 'bg-[var(--color-primary)] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {idiom && <SpeakingChallenge key={`${idiom.id}-${mode}-${refreshKey}`} idiom={idiom} mode={mode} />}

      <Button variant="ghost" onClick={() => setRefreshKey((k) => k + 1)}>Другая идиома →</Button>
    </div>
  );
}
