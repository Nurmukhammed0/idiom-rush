import { useMemo, useState } from 'react';
import { useExerciseTimer } from '@/hooks/useExerciseTimer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnswerFeedback } from './AnswerFeedback';
import type { ExerciseProps } from './types';

const AWKWARD_TEMPLATES = [
  (idiom: string) => `I went to the supermarket ${idiom} yesterday.`,
  (idiom: string) => `${idiom.charAt(0).toUpperCase() + idiom.slice(1)}, she bought some bread at the store.`,
  (idiom: string) => `He is ${idiom} very much about the weather report.`,
  (idiom: string) => `We ${idiom} the bus stop near the school building.`,
];

export function NaturalOrNot({ idiom, onAnswer }: ExerciseProps) {
  const getElapsed = useExerciseTimer(idiom.id);
  const [answered, setAnswered] = useState<boolean | null>(null);

  const { sentence, isNatural } = useMemo(() => {
    const natural = Math.random() > 0.5;
    if (natural) return { sentence: idiom.example_sentence, isNatural: true };
    const template = AWKWARD_TEMPLATES[Math.floor(Math.random() * AWKWARD_TEMPLATES.length)];
    return { sentence: template(idiom.idiom), isNatural: false };
  }, [idiom]);

  function choose(userSaysNatural: boolean) {
    if (answered !== null) return;
    const correct = userSaysNatural === isNatural;
    setAnswered(correct);
    setTimeout(() => onAnswer(correct, getElapsed()), 1300);
  }

  return (
    <Card className="p-6">
      <div className="text-xs font-bold uppercase text-gray-400 mb-2">Естественно или нет?</div>
      <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">"{sentence}"</p>
      <p className="text-sm font-semibold text-gray-600 mb-3">Звучит ли это естественно для носителя языка?</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => choose(true)} disabled={answered !== null}>Естественно ✓</Button>
        <Button variant="secondary" onClick={() => choose(false)} disabled={answered !== null}>Неестественно</Button>
      </div>
      {answered !== null && (
        <AnswerFeedback
          correct={answered}
          explanation={
            isNatural
              ? `Естественный пример использования "${idiom.idiom}".`
              : `Так носители не говорят. Естественный пример: "${idiom.example_sentence}"`
          }
        />
      )}
    </Card>
  );
}
