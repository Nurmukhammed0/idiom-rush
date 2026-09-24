import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PracticeSession } from '@/features/practice/PracticeSession';
import { buildPracticeQueue, buildNewIdiomsQueue } from '@/features/practice/smartPracticeEngine';
import { IDIOM_BY_ID } from '@/data/idiomsRepository';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';

const SESSION_SIZE = 10;

export default function Practice() {
  const [params] = useSearchParams();
  const singleIdiomId = params.get('idiom');
  const progress = useAppStore((s) => s.progress);
  const englishLevel = useAppStore((s) => s.stats.englishLevel);
  const [sessionKey, setSessionKey] = useState(0);

  const idioms = useMemo(() => {
    if (singleIdiomId && IDIOM_BY_ID[singleIdiomId]) return [IDIOM_BY_ID[singleIdiomId]];
    const reviewIdioms = buildPracticeQueue({ progress, englishLevel }, Math.ceil(SESSION_SIZE * 0.6));
    const excludeIds = new Set(reviewIdioms.map((i) => i.id));
    const newIdioms = buildNewIdiomsQueue({ progress, englishLevel }, SESSION_SIZE - reviewIdioms.length).filter((i) => !excludeIds.has(i.id));
    return [...reviewIdioms, ...newIdioms].slice(0, SESSION_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleIdiomId, sessionKey]);

  if (idioms.length === 0) {
    return (
      <Card className="p-10 text-center max-w-md mx-auto">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="font-bold text-gray-900 mb-1">Все идиомы изучены!</h2>
        <p className="text-sm text-gray-500">Загляните на вкладку "Повторение" позже.</p>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Практика</h1>
      <PracticeSession key={sessionKey} idioms={idioms} onFinish={() => setSessionKey((k) => k + 1)} />
    </div>
  );
}
