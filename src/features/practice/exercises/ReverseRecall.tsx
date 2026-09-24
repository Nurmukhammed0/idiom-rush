import { useState } from 'react';
import { useExerciseTimer } from '@/hooks/useExerciseTimer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnswerFeedback } from './AnswerFeedback';
import type { ExerciseProps } from './types';

function normalize(s: string): string {
  return s.toLowerCase().replace(/^(a|an|to)\s+/, '').replace(/[^a-z0-9' ]/g, '').replace(/\s+/g, ' ').trim();
}

export function ReverseRecall({ idiom, onAnswer }: ExerciseProps) {
  const getElapsed = useExerciseTimer(idiom.id);
  const [typed, setTyped] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (submitted || !typed.trim()) return;
    setSubmitted(true);
    const correct = normalize(typed) === normalize(idiom.idiom);
    setTimeout(() => onAnswer(correct, getElapsed()), 1100);
  }

  return (
    <Card className="p-6">
      <div className="text-xs font-bold uppercase text-gray-400 mb-2">Обратное вспоминание — без подсказок</div>
      <p className="text-sm text-gray-500 mb-1">Значение:</p>
      <p className="text-lg font-medium text-gray-900 mb-6">"{idiom.meaning_en}"</p>
      <p className="text-sm font-semibold text-gray-600 mb-3">Какая это идиома?</p>
      <div className="flex gap-2">
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={submitted}
          placeholder="Напишите идиому..."
          autoFocus
          className="focus-ring flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm uppercase"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <Button onClick={submit} disabled={submitted || !typed.trim()}>Ответить</Button>
      </div>
      {submitted && (
        <AnswerFeedback correct={normalize(typed) === normalize(idiom.idiom)} explanation={`Правильный ответ: "${idiom.idiom}"`} />
      )}
    </Card>
  );
}
