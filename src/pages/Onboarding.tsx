import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';
import type { UserStats } from '@/types/progress';

const LEVELS: { value: NonNullable<UserStats['englishLevel']>; label: string }[] = [
  { value: 'A2', label: 'A2 — начальный' },
  { value: 'B1', label: 'B1 — средний' },
  { value: 'B2', label: 'B2 — выше среднего' },
  { value: 'C1', label: 'C1 — продвинутый' },
  { value: 'C2', label: 'C2 — свободное владение' },
];

const GOALS: { value: NonNullable<UserStats['learningGoal']>; label: string; emoji: string }[] = [
  { value: 'conversation', label: 'Разговорная речь', emoji: '💬' },
  { value: 'ielts', label: 'Подготовка к IELTS', emoji: '📝' },
  { value: 'work', label: 'Работа', emoji: '💼' },
  { value: 'university', label: 'Учёба в университете', emoji: '🎓' },
  { value: 'general', label: 'Английский вообще', emoji: '🌍' },
];

const TIMES: { value: NonNullable<UserStats['dailyTimeMinutes']>; label: string }[] = [
  { value: 5, label: '5 минут' },
  { value: 10, label: '10 минут' },
  { value: 20, label: '20 минут' },
  { value: 30, label: '30+ минут' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<UserStats['englishLevel']>(null);
  const [goal, setGoal] = useState<UserStats['learningGoal']>(null);
  const [minutes, setMinutes] = useState<UserStats['dailyTimeMinutes']>(null);

  function finish() {
    completeOnboarding(level, goal, minutes);
    navigate('/dashboard');
  }

  const steps = [
    {
      title: 'Какой у вас уровень английского?',
      content: (
        <div className="space-y-2.5">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => { setLevel(l.value); setStep(1); }}
              className={`focus-ring w-full text-left p-4 rounded-xl border-2 font-medium transition-colors ${level === l.value ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-100 hover:border-gray-200'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Какая у вас цель?',
      content: (
        <div className="grid grid-cols-2 gap-2.5">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => { setGoal(g.value); setStep(2); }}
              className={`focus-ring p-4 rounded-xl border-2 font-medium text-sm transition-colors ${goal === g.value ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className="text-2xl mb-1">{g.emoji}</div>
              {g.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Сколько времени в день вы готовы уделять?',
      content: (
        <div className="grid grid-cols-2 gap-2.5">
          {TIMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setMinutes(t.value)}
              className={`focus-ring p-4 rounded-xl border-2 font-medium transition-colors ${minutes === t.value ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-100 hover:border-gray-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size={40} /></div>
        <Card className="p-6 md:p-8">
          <div className="flex gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[var(--color-primary)]' : 'bg-gray-100'}`} />
            ))}
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-5">{steps[step].title}</h1>
          {steps[step].content}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Назад</Button>
            ) : <span />}
            {step === steps.length - 1 && (
              <Button onClick={finish} disabled={!minutes}>Начать обучение</Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
