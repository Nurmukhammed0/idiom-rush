import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PracticeSession } from '@/features/practice/PracticeSession';
import { buildPracticeQueue } from '@/features/practice/smartPracticeEngine';
import { IDIOM_BY_ID } from '@/data/idiomsRepository';
import type { IdiomCategory } from '@/types/idiom';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const SESSION_SIZE = 10;

export default function Practice() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const singleIdiomId = params.get('idiom');
  const category = params.get('category') as IdiomCategory | null;
  const progress = useAppStore((s) => s.progress);
  const isLearned = useAppStore((s) => s.isLearned);
  const englishLevel = useAppStore((s) => s.stats.englishLevel);
  const setResume = useAppStore((s) => s.setResume);
  const [sessionKey, setSessionKey] = useState(0);

  // Practice only ever tests idioms the learner has already been through Learn for.
  // A link to an idiom that hasn't been introduced yet sends them to Learn instead.
  useEffect(() => {
    if (singleIdiomId && IDIOM_BY_ID[singleIdiomId] && !isLearned(singleIdiomId)) {
      navigate(`/learn?idiom=${singleIdiomId}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleIdiomId]);

  const idioms = useMemo(() => {
    if (singleIdiomId && IDIOM_BY_ID[singleIdiomId] && isLearned(singleIdiomId)) {
      return [IDIOM_BY_ID[singleIdiomId]];
    }
    return buildPracticeQueue({ progress, englishLevel, category: category ?? undefined }, SESSION_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleIdiomId, sessionKey, progress, category]);

  useEffect(() => {
    if (idioms[0]) setResume({ mode: 'practice', idiomId: idioms[0].id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idioms]);

  if (idioms.length === 0) {
    return (
      <EmptyState
        icon="🎓"
        title="Пока нечего практиковать"
        description="Сначала изучите несколько идиом в разделе «Learn» — практика открывается только для уже изученных идиом."
        action={<Button onClick={() => navigate('/learn')}>Перейти к изучению</Button>}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Practice</h1>
      <PracticeSession key={sessionKey} idioms={idioms} onFinish={() => { setResume(null); setSessionKey((k) => k + 1); }} />
    </div>
  );
}
