import { useMemo, useState } from 'react';
import { getDistractors } from '@/data/idiomsRepository';
import { useExerciseTimer } from '@/hooks/useExerciseTimer';
import { Card } from '@/components/ui/Card';
import { AnswerFeedback } from './AnswerFeedback';
import type { ExerciseProps } from './types';

export function MeaningQuiz({ idiom, onAnswer }: ExerciseProps) {
  const getElapsed = useExerciseTimer(idiom.id);
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(() => {
    const distractors = getDistractors(idiom, 3).map((i) => i.meaning_en);
    const all = [...distractors, idiom.meaning_en];
    return all.sort(() => Math.random() - 0.5);
  }, [idiom]);

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    const correct = option === idiom.meaning_en;
    setTimeout(() => onAnswer(correct, getElapsed()), 900);
  }

  return (
    <Card className="p-6">
      <div className="text-xs font-bold uppercase text-gray-400 mb-2">Что означает эта идиома?</div>
      <h2 className="text-2xl font-extrabold text-gray-900 uppercase mb-6">"{idiom.idiom}"</h2>
      <div className="space-y-2.5">
        {options.map((opt) => {
          const isCorrect = opt === idiom.meaning_en;
          const showState = selected !== null;
          const isSelected = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={selected !== null}
              className={`focus-ring w-full text-left p-4 rounded-xl border-2 text-sm transition-colors ${
                showState && isCorrect
                  ? 'border-[var(--color-success)] bg-[var(--color-success-light)]'
                  : showState && isSelected
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected && <AnswerFeedback correct={selected === idiom.meaning_en} explanation={idiom.meaning_en} />}
    </Card>
  );
}
