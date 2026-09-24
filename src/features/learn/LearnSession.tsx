import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Volume2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ListenButtons } from '@/components/ListenButtons';
import { XpFloat } from '@/components/XpFloat';
import { SpeakingChallenge } from '@/features/speaking/SpeakingChallenge';
import { MeaningQuiz } from '@/features/practice/exercises/MeaningQuiz';
import { FillGap } from '@/features/practice/exercises/FillGap';
import { ReverseRecall } from '@/features/practice/exercises/ReverseRecall';
import { ContextQuiz } from '@/features/practice/exercises/ContextQuiz';
import { buildMiniScene } from './miniScene';
import { useAppStore } from '@/store/useAppStore';
import type { Idiom } from '@/types/idiom';
import type { ExerciseType } from '@/types/progress';

const STEPS = [
  'card',
  'explain',
  'example',
  'context',
  'listen',
  'repeat',
  'meaning_quiz',
  'fill_gap',
  'reverse_recall',
  'context_quiz',
  'speaking_sentence',
  'celebrate',
] as const;
type Step = (typeof STEPS)[number];

const fadeMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2 },
};

export function LearnSession({ queue, onComplete }: { queue: Idiom[]; onComplete: () => void }) {
  const recordReview = useAppStore((s) => s.recordReview);
  const setResume = useAppStore((s) => s.setResume);
  const xp = useAppStore((s) => s.stats.xp);
  const [idiomIndex, setIdiomIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [xpTrigger, setXpTrigger] = useState(0);
  const [xpAmount, setXpAmount] = useState(0);
  const xpAtIdiomStart = useRef(xp);

  const idiom = queue[idiomIndex];
  const step: Step = STEPS[stepIndex];
  const done = idiomIndex >= queue.length;

  useEffect(() => {
    if (idiom) setResume({ mode: 'learn', idiomId: idiom.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idiom?.id]);

  useEffect(() => {
    if (step === 'card') xpAtIdiomStart.current = xp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idiomIndex]);

  function nextStep() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function handleQuizAnswer(type: ExerciseType, correct: boolean, ms: number) {
    recordReview(idiom.id, type, correct, ms);
    setTimeout(nextStep, correct ? 250 : 600);
  }

  useEffect(() => {
    if (step !== 'celebrate') return;
    const gained = Math.max(0, useAppStore.getState().stats.xp - xpAtIdiomStart.current);
    setXpAmount(gained);
    setXpTrigger((t) => t + 1);
    const t = setTimeout(() => {
      if (idiomIndex + 1 >= queue.length) {
        setResume(null);
        onComplete();
      } else {
        setIdiomIndex((i) => i + 1);
        setStepIndex(0);
      }
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (done) return null;

  const progressPct = ((idiomIndex + (stepIndex / STEPS.length)) / queue.length) * 100;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <XpFloat amount={xpAmount} trigger={xpTrigger} />
      <div className="flex items-center gap-3">
        <ProgressBar value={progressPct} height={8} />
        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
          {idiomIndex + 1}/{queue.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 'card' && (
          <motion.div key={`card-${idiom.id}`} {...fadeMotion}>
            <Card className="p-8 text-center">
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 mb-4">
                {idiom.level} · {idiom.category}
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tight mb-3">"{idiom.idiom}"</h1>
              <p className="text-sm text-gray-400 font-mono mb-6">{idiom.pronunciation}</p>
              <div className="flex justify-center">
                <ListenButtons text={idiom.idiom} />
              </div>
              <Button size="lg" className="mt-8" onClick={nextStep} fullWidth>
                Далее <ArrowRight size={18} />
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 'explain' && (
          <motion.div key={`explain-${idiom.id}`} {...fadeMotion}>
            <Card className="p-8">
              <div className="text-xs font-bold uppercase text-gray-400 mb-2">Значение</div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase">"{idiom.idiom}"</h2>
              <p className="text-lg text-gray-800 mb-4">{idiom.meaning_en}</p>
              <div className="bg-[var(--color-primary-light)] rounded-xl p-4 mb-2">
                <div className="text-xs font-bold uppercase text-[var(--color-primary)] mb-1">Перевод</div>
                <p className="text-gray-800 font-medium">{idiom.meaning_ru}</p>
              </div>
              <Button size="lg" className="mt-6" onClick={nextStep} fullWidth>
                Понял
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 'example' && (
          <motion.div key={`example-${idiom.id}`} {...fadeMotion}>
            <Card className="p-8">
              <div className="text-xs font-bold uppercase text-gray-400 mb-3">Живой пример</div>
              <p className="text-xl text-gray-900 italic leading-relaxed mb-2">"{idiom.example_sentence}"</p>
              <p className="text-sm text-gray-400">{idiom.example_context}</p>
              <Button size="lg" className="mt-8" onClick={nextStep} fullWidth>
                Далее <ArrowRight size={18} />
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 'context' && (
          <motion.div key={`context-${idiom.id}`} {...fadeMotion}>
            <Card className="p-8">
              <div className="text-xs font-bold uppercase text-gray-400 mb-3">🎬 Представьте ситуацию</div>
              <p className="text-xl text-gray-900 leading-relaxed mb-2">{buildMiniScene(idiom)}</p>
              <p className="text-sm text-gray-500 mt-4">
                Именно в такой ситуации носители языка скажут: <span className="font-semibold text-gray-800">"{idiom.idiom}"</span>
              </p>
              <Button size="lg" className="mt-8" onClick={nextStep} fullWidth>
                Далее <ArrowRight size={18} />
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 'listen' && (
          <motion.div key={`listen-${idiom.id}`} {...fadeMotion}>
            <Card className="p-8 text-center">
              <div className="text-xs font-bold uppercase text-gray-400 mb-3 flex items-center justify-center gap-2">
                <Volume2 size={14} /> Прослушайте внимательно
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 uppercase mb-6">"{idiom.idiom}"</h2>
              <div className="flex justify-center">
                <ListenButtons text={idiom.idiom} />
              </div>
              <Button size="lg" className="mt-8" onClick={nextStep} fullWidth>
                Готов повторить <ArrowRight size={18} />
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 'repeat' && (
          <motion.div key={`repeat-${idiom.id}`} {...fadeMotion}>
            <SpeakingChallenge idiom={idiom} mode="repeat" onContinue={nextStep} />
          </motion.div>
        )}

        {step === 'meaning_quiz' && (
          <motion.div key={`meaning-${idiom.id}`} {...fadeMotion}>
            <MeaningQuiz idiom={idiom} onAnswer={(c, t) => handleQuizAnswer('meaning', c, t)} />
          </motion.div>
        )}

        {step === 'fill_gap' && (
          <motion.div key={`fillgap-${idiom.id}`} {...fadeMotion}>
            <FillGap idiom={idiom} onAnswer={(c, t) => handleQuizAnswer('fill_gap', c, t)} />
          </motion.div>
        )}

        {step === 'reverse_recall' && (
          <motion.div key={`reverse-${idiom.id}`} {...fadeMotion}>
            <ReverseRecall idiom={idiom} onAnswer={(c, t) => handleQuizAnswer('reverse_recall', c, t)} />
          </motion.div>
        )}

        {step === 'context_quiz' && (
          <motion.div key={`ctxquiz-${idiom.id}`} {...fadeMotion}>
            <ContextQuiz idiom={idiom} onAnswer={(c, t) => handleQuizAnswer('context', c, t)} />
          </motion.div>
        )}

        {step === 'speaking_sentence' && (
          <motion.div key={`speak-${idiom.id}`} {...fadeMotion}>
            <SpeakingChallenge idiom={idiom} mode="own_sentence" onContinue={nextStep} />
          </motion.div>
        )}

        {step === 'celebrate' && (
          <motion.div
            key={`celebrate-${idiom.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="p-10 text-center">
              <Sparkles className="mx-auto text-[var(--color-primary)] mb-3" size={36} />
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Отлично! 🎉</h2>
              <p className="text-gray-500">
                {idiomIndex + 1} из {queue.length} изучено
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
