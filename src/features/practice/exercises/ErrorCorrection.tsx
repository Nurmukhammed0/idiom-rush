import { useMemo, useState } from 'react';
import { getRandomIdioms } from '@/data/idiomsRepository';
import { buildFillGap } from './fillGapUtils';
import { useExerciseTimer } from '@/hooks/useExerciseTimer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnswerFeedback } from './AnswerFeedback';
import type { ExerciseProps } from './types';

export function ErrorCorrection({ idiom, onAnswer }: ExerciseProps) {
  const getElapsed = useExerciseTimer(idiom.id);
  const [answered, setAnswered] = useState<boolean | null>(null);

  const { sentence, isCorrectUsage } = useMemo(() => {
    const showCorrect = Math.random() > 0.5;
    if (showCorrect) return { sentence: idiom.example_sentence, isCorrectUsage: true };
    const [other] = getRandomIdioms(1, new Set([idiom.id]));
    if (!other) return { sentence: idiom.example_sentence, isCorrectUsage: true };
    const { gappedSentence } = buildFillGap(other.idiom, other.example_sentence);
    const wrong = gappedSentence.replace('_____', idiom.idiom);
    return { sentence: wrong, isCorrectUsage: false };
  }, [idiom]);

  function choose(userSaysCorrect: boolean) {
    if (answered !== null) return;
    const correct = userSaysCorrect === isCorrectUsage;
    setAnswered(correct);
    setTimeout(() => onAnswer(correct, getElapsed()), 1300);
  }

  return (
    <Card className="p-6">
      <div className="text-xs font-bold uppercase text-gray-400 mb-2">Исправление ошибок</div>
      <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">"{sentence}"</p>
      <p className="text-sm font-semibold text-gray-600 mb-3">Идиома "{idiom.idiom}" использована правильно?</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => choose(true)} disabled={answered !== null}>Да, правильно</Button>
        <Button variant="secondary" onClick={() => choose(false)} disabled={answered !== null}>Нет, неправильно</Button>
      </div>
      {answered !== null && (
        <AnswerFeedback
          correct={answered}
          explanation={
            isCorrectUsage
              ? `Верно использовано: означает "${idiom.meaning_en}".`
              : `Здесь использовано неверно. "${idiom.idiom}" значит "${idiom.meaning_en}" — правильный пример: "${idiom.example_sentence}"`
          }
        />
      )}
    </Card>
  );
}
