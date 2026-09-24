import { useState } from 'react';
import { PracticeSession } from '@/features/practice/PracticeSession';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function Review() {
  const getDueIdioms = useAppStore((s) => s.getDueIdioms);
  const [started, setStarted] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const due = getDueIdioms();

  if (started && due.length > 0) {
    return <PracticeSession key={sessionKey} idioms={due} onFinish={() => setSessionKey((k) => k + 1)} />;
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Повторение</h1>
      {due.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Очередь повторения пуста"
          description="Отличная работа! Возвращайтесь позже, когда идиомы будут готовы к повторению."
        />
      ) : (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-lg font-semibold text-gray-900 mb-1">{due.length} идиом ждут повторения</p>
          <p className="text-sm text-gray-500 mb-6">Активное вспоминание закрепляет память надолго.</p>
          <Button size="lg" onClick={() => setStarted(true)}>Начать повторение</Button>
        </Card>
      )}
    </div>
  );
}
