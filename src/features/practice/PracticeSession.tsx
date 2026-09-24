import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { XpFloat } from '@/components/XpFloat';
import { useAppStore } from '@/store/useAppStore';
import { xpForExercise } from '@/services/xp';
import type { Idiom } from '@/types/idiom';
import type { ExerciseType } from '@/types/progress';
import { MeaningQuiz } from './exercises/MeaningQuiz';
import { FillGap } from './exercises/FillGap';
import { ContextQuiz } from './exercises/ContextQuiz';
import { ReverseRecall } from './exercises/ReverseRecall';
import { ErrorCorrection } from './exercises/ErrorCorrection';
import { NaturalOrNot } from './exercises/NaturalOrNot';
import { MatchGame } from './exercises/MatchGame';

const RECALL_TYPES: ExerciseType[] = ['meaning', 'fill_gap', 'context', 'reverse_recall', 'error_correction', 'natural_or_not'];

interface Step {
  kind: 'exercise' | 'match';
  idiom?: Idiom;
  exerciseType?: ExerciseType;
  matchGroup?: Idiom[];
}

function buildSteps(idioms: Idiom[]): Step[] {
  const steps: Step[] = [];
  let lastType: ExerciseType | null = null;
  idioms.forEach((idiom, i) => {
    if (i > 0 && i % 5 === 0 && idioms.length - i >= 3) {
      steps.push({ kind: 'match', matchGroup: idioms.slice(i, Math.min(i + 4, idioms.length)) });
    }
    let type = RECALL_TYPES[Math.floor(Math.random() * RECALL_TYPES.length)];
    while (type === lastType) type = RECALL_TYPES[Math.floor(Math.random() * RECALL_TYPES.length)];
    lastType = type;
    steps.push({ kind: 'exercise', idiom, exerciseType: type });
  });
  return steps;
}

export function PracticeSession({ idioms, onFinish }: { idioms: Idiom[]; onFinish: () => void }) {
  const navigate = useNavigate();
  const recordReview = useAppStore((s) => s.recordReview);
  const steps = useMemo(() => buildSteps(idioms), [idioms]);
  const [stepIndex, setStepIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpTrigger, setXpTrigger] = useState(0);
  const [xpAmount, setXpAmount] = useState(0);
  const matchHandled = useRef(false);

  const step = steps[stepIndex];
  const done = stepIndex >= steps.length;

  function advance() {
    setStepIndex((i) => i + 1);
    matchHandled.current = false;
  }

  function handleAnswer(idiom: Idiom, type: ExerciseType, correct: boolean, responseTimeMs: number) {
    recordReview(idiom.id, type, correct, responseTimeMs);
    if (correct) {
      setCorrectCount((c) => c + 1);
      const gained = xpForExercise(type, true);
      setXpAmount(gained);
      setXpTrigger((t) => t + 1);
    }
    setTimeout(advance, 400);
  }

  function handleMatchComplete(results: { idiomId: string; correct: boolean }[]) {
    if (matchHandled.current) return;
    matchHandled.current = true;
    results.forEach((r) => recordReview(r.idiomId, 'match', r.correct, 3000));
    const gainedCorrect = results.filter((r) => r.correct).length;
    setCorrectCount((c) => c + gainedCorrect);
    setXpAmount(gainedCorrect * xpForExercise('match', true));
    setXpTrigger((t) => t + 1);
    setTimeout(advance, 600);
  }

  if (done) {
    const total = idioms.length;
    const pct = total > 0 ? Math.round((correctCount / (steps.filter((s) => s.kind === 'exercise').length || 1)) * 100) : 0;
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Сессия завершена!</h2>
        <p className="text-gray-500 mb-6">Правильных ответов: {correctCount} · Точность {pct}%</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>На главную</Button>
          <Button onClick={onFinish}>Ещё сессия</Button>
        </div>
      </Card>
    );
  }

  const exerciseStepsTotal = steps.filter((s) => s.kind === 'exercise').length;
  const exerciseStepsDone = steps.slice(0, stepIndex).filter((s) => s.kind === 'exercise').length;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <XpFloat amount={xpAmount} trigger={xpTrigger} />
      <div className="flex items-center gap-3">
        <ProgressBar value={exerciseStepsDone} max={exerciseStepsTotal} height={8} />
        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{exerciseStepsDone}/{exerciseStepsTotal}</span>
      </div>

      {step.kind === 'match' && step.matchGroup && (
        <MatchGame key={stepIndex} idioms={step.matchGroup} onComplete={handleMatchComplete} />
      )}

      {step.kind === 'exercise' && step.idiom && step.exerciseType === 'meaning' && (
        <MeaningQuiz key={stepIndex} idiom={step.idiom} onAnswer={(c, t) => handleAnswer(step.idiom!, 'meaning', c, t)} />
      )}
      {step.kind === 'exercise' && step.idiom && step.exerciseType === 'fill_gap' && (
        <FillGap key={stepIndex} idiom={step.idiom} onAnswer={(c, t) => handleAnswer(step.idiom!, 'fill_gap', c, t)} />
      )}
      {step.kind === 'exercise' && step.idiom && step.exerciseType === 'context' && (
        <ContextQuiz key={stepIndex} idiom={step.idiom} onAnswer={(c, t) => handleAnswer(step.idiom!, 'context', c, t)} />
      )}
      {step.kind === 'exercise' && step.idiom && step.exerciseType === 'reverse_recall' && (
        <ReverseRecall key={stepIndex} idiom={step.idiom} onAnswer={(c, t) => handleAnswer(step.idiom!, 'reverse_recall', c, t)} />
      )}
      {step.kind === 'exercise' && step.idiom && step.exerciseType === 'error_correction' && (
        <ErrorCorrection key={stepIndex} idiom={step.idiom} onAnswer={(c, t) => handleAnswer(step.idiom!, 'error_correction', c, t)} />
      )}
      {step.kind === 'exercise' && step.idiom && step.exerciseType === 'natural_or_not' && (
        <NaturalOrNot key={stepIndex} idiom={step.idiom} onAnswer={(c, t) => handleAnswer(step.idiom!, 'natural_or_not', c, t)} />
      )}
    </div>
  );
}
