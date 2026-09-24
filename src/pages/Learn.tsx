import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LearnSession } from '@/features/learn/LearnSession';
import { PracticeSession } from '@/features/practice/PracticeSession';
import { buildNewIdiomsQueue, buildPracticeQueue } from '@/features/practice/smartPracticeEngine';
import { IDIOM_BY_ID } from '@/data/idiomsRepository';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function Learn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const singleIdiomId = params.get('idiom');
  const progress = useAppStore((s) => s.progress);
  const englishLevel = useAppStore((s) => s.stats.englishLevel);
  const dailyGoal = useAppStore((s) => s.stats.dailyGoal);
  const [phase, setPhase] = useState<'learning' | 'reviewing' | 'done'>('learning');
  const [sessionKey, setSessionKey] = useState(0);

  const newIdiomsCount = dailyGoal <= 5 ? 3 : 5;

  const newQueue = useMemo(() => {
    if (singleIdiomId && IDIOM_BY_ID[singleIdiomId]) return [IDIOM_BY_ID[singleIdiomId]];
    return buildNewIdiomsQueue({ progress, englishLevel }, newIdiomsCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, singleIdiomId]);

  const reviewQueue = useMemo(
    () => buildPracticeQueue({ progress, englishLevel }, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey, phase]
  );

  if (newQueue.length === 0 && phase === 'learning') {
    if (reviewQueue.length > 0) {
      return (
        <div>
          <Header phase="reviewing" />
          <PracticeSession idioms={reviewQueue} onFinish={() => navigate('/dashboard')} />
        </div>
      );
    }
    return (
      <EmptyState
        icon="🎉"
        title="Все идиомы изучены!"
        description="Вы прошли все 1000 идиом в базе. Загляните в раздел «Повторение», чтобы закрепить их."
        action={<Button onClick={() => navigate('/review')}>Перейти к повторению</Button>}
      />
    );
  }

  if (phase === 'done') {
    return (
      <Card className="p-10 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Отличная тренировка!</h2>
        <p className="text-gray-500 mb-6">Вы изучили новые идиомы и повторили уже знакомые.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>На главную</Button>
          <Button onClick={() => { setSessionKey((k) => k + 1); setPhase('learning'); }}>Ещё немного</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Header phase={phase} />
      {phase === 'learning' ? (
        <LearnSession key={sessionKey} queue={newQueue} onComplete={() => setPhase('reviewing')} />
      ) : (
        <PracticeSession
          key={`review-${sessionKey}`}
          idioms={reviewQueue.length > 0 ? reviewQueue : newQueue}
          onFinish={() => setPhase('done')}
        />
      )}
    </div>
  );
}

function Header({ phase }: { phase: 'learning' | 'reviewing' }) {
  return (
    <div className="max-w-xl mx-auto mb-5 text-center">
      <h1 className="text-xl font-extrabold text-gray-900">
        {phase === 'learning' ? '🎓 Изучение новых идиом' : '🔁 Теперь закрепим то, что вы уже знаете'}
      </h1>
    </div>
  );
}
