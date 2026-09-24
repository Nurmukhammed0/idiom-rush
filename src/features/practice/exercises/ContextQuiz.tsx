import { useMemo, useState } from 'react';
import { getDistractors } from '@/data/idiomsRepository';
import { useExerciseTimer } from '@/hooks/useExerciseTimer';
import { Card } from '@/components/ui/Card';
import { AnswerFeedback } from './AnswerFeedback';
import type { ExerciseProps } from './types';

function toSituation(meaning: string): string {
  const m = meaning.trim();
  if (m.toLowerCase().startsWith('to ')) return `You want to describe someone who is trying ${m}`;
  if (m.toLowerCase().startsWith('a ') || m.toLowerCase().startsWith('an ')) return `You want to describe ${m}`;
  return `You want to describe a situation where ${m.charAt(0).toLowerCase() + m.slice(1)}`;
}

export function ContextQuiz({ idiom, onAnswer }: ExerciseProps) {
  const getElapsed = useExerciseTimer(idiom.id);
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(() => {
    const distractors = getDistractors(idiom, 3).map((i) => i.idiom);
    return [...distractors, idiom.idiom].sort(() => Math.random() - 0.5);
  }, [idiom]);

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    setTimeout(() => onAnswer(option === idiom.idiom, getElapsed()), 900);
  }

  return (
    <Card className="p-6">
      <div className="text-xs font-bold uppercase text-gray-400 mb-2">Ситуация · {idiom.category}</div>
      <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">{toSituation(idiom.meaning_en)}.</p>
      <div className="text-sm font-semibold text-gray-600 mb-3">Какая идиома здесь лучше всего подходит?</div>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const isCorrect = opt === idiom.idiom;
          const showState = selected !== null;
          const isSelected = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={selected !== null}
              className={`focus-ring p-4 rounded-xl border-2 text-sm font-semibold uppercase tracking-tight transition-colors ${
                showState && isCorrect
                  ? 'border-[var(--color-success)] bg-[var(--color-success-light)]'
                  : showState && isSelected
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected && <AnswerFeedback correct={selected === idiom.idiom} explanation={`"${idiom.idiom}" — ${idiom.meaning_en}`} />}
    </Card>
  );
}
