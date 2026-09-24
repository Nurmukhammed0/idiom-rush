import { useMemo, useState } from 'react';
import { getDistractors } from '@/data/idiomsRepository';
import { useExerciseTimer } from '@/hooks/useExerciseTimer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnswerFeedback } from './AnswerFeedback';
import { buildFillGap } from './fillGapUtils';
import type { ExerciseProps } from './types';

export function FillGap({ idiom, onAnswer }: ExerciseProps) {
  const getElapsed = useExerciseTimer(idiom.id);
  const [selected, setSelected] = useState<string | null>(null);
  const [typedMode, setTypedMode] = useState(false);
  const [typed, setTyped] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { gappedSentence, answer } = useMemo(() => buildFillGap(idiom.idiom, idiom.example_sentence), [idiom]);

  const options = useMemo(() => {
    const distractorWords = getDistractors(idiom, 3).map((i) => {
      const words = i.idiom.split(' ');
      return words[words.length - 1];
    });
    const all = [...new Set([...distractorWords, answer.split(' ').pop() as string])];
    while (all.length < 4) all.push('—');
    return all.sort(() => Math.random() - 0.5);
  }, [idiom, answer]);

  function normalize(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9' ]/g, '').trim();
  }

  function submitChoice(option: string) {
    if (selected) return;
    setSelected(option);
    setSubmitted(true);
    const correct = normalize(option) === normalize(answer.split(' ').pop() ?? answer);
    setTimeout(() => onAnswer(correct, getElapsed()), 900);
  }

  function submitTyped() {
    if (submitted) return;
    setSubmitted(true);
    const correct = normalize(typed) === normalize(answer);
    setTimeout(() => onAnswer(correct, getElapsed()), 900);
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold uppercase text-gray-400">Заполните пропуск</div>
        <button className="focus-ring text-xs font-semibold text-[var(--color-primary)]" onClick={() => setTypedMode((v) => !v)} disabled={submitted}>
          {typedMode ? 'Выбрать вариант' : 'Ввести самому'}
        </button>
      </div>
      <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">{gappedSentence}</p>

      {!typedMode ? (
        <div className="grid grid-cols-2 gap-2.5">
          {options.map((opt) => {
            const isCorrect = normalize(opt) === normalize(answer.split(' ').pop() ?? answer);
            const isSelected = selected === opt;
            return (
              <button
                key={opt}
                onClick={() => submitChoice(opt)}
                disabled={submitted}
                className={`focus-ring p-3.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                  submitted && isCorrect
                    ? 'border-[var(--color-success)] bg-[var(--color-success-light)]'
                    : submitted && isSelected
                    ? 'border-[var(--color-danger)] bg-[var(--color-danger-light)]'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={submitted}
            placeholder="Ваш ответ..."
            className="focus-ring flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && submitTyped()}
          />
          <Button onClick={submitTyped} disabled={submitted || !typed.trim()}>Ответить</Button>
        </div>
      )}

      {submitted && (
        <AnswerFeedback
          correct={typedMode ? normalize(typed) === normalize(answer) : normalize(selected ?? '') === normalize(answer.split(' ').pop() ?? answer)}
          explanation={`Правильный ответ: "${answer}"`}
        />
      )}
    </Card>
  );
}
