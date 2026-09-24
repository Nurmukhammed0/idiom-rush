import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StreakCalendar } from '@/components/StreakCalendar';
import { useAppStore } from '@/store/useAppStore';

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-medium text-gray-900 text-sm">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={`focus-ring w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const stats = useAppStore((s) => s.stats);
  const setShowTranslations = useAppStore((s) => s.setShowTranslations);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);
  const setDailyGoal = useAppStore((s) => s.setDailyGoal);
  const resetAllData = useAppStore((s) => s.resetAllData);
  const loadDemoData = useAppStore((s) => s.loadDemoData);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Настройки</h1>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 mb-1">Профиль</h2>
        <p className="text-sm text-gray-500 mb-4">Демо-режим — данные хранятся локально в этом браузере.</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-400">Уровень: </span><span className="font-semibold">{stats.englishLevel ?? '—'}</span></div>
          <div><span className="text-gray-400">Цель: </span><span className="font-semibold">{stats.learningGoal ?? '—'}</span></div>
        </div>
      </Card>

      <Card className="p-6 divide-y divide-gray-100">
        <Toggle checked={stats.showTranslations} onChange={setShowTranslations} label="Показывать перевод" description="Русский перевод под каждой идиомой" />
        <Toggle checked={stats.soundEnabled} onChange={setSoundEnabled} label="Звуковые эффекты" description="Звук при правильном ответе и достижениях" />
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 mb-3">Ежедневная цель</h2>
        <div className="flex gap-2">
          {[5, 10, 15, 20].map((g) => (
            <button
              key={g}
              onClick={() => setDailyGoal(g)}
              className={`focus-ring flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                stats.dailyGoal === g ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'border-gray-100 text-gray-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 mb-3">Календарь активности</h2>
        <StreakCalendar />
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="font-bold text-gray-900 mb-1">Данные</h2>
        <Button variant="secondary" fullWidth onClick={loadDemoData}>Загрузить демо-данные</Button>
        <Button variant="danger" fullWidth onClick={() => confirm('Сбросить весь прогресс?') && resetAllData()}>Сбросить весь прогресс</Button>
      </Card>
    </div>
  );
}
