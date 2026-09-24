import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Star, Brain, Target, ArrowRight, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MiniSparkline } from '@/components/MiniSparkline';
import { useAppStore } from '@/store/useAppStore';
import { buildNewIdiomsQueue } from '@/features/practice/smartPracticeEngine';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function StatTile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}1A`, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-extrabold text-gray-900 leading-tight">{value}</div>
        <div className="text-xs text-gray-500 leading-snug">{label}</div>
      </div>
    </Card>
  );
}

function ChecklistItem({ label, done, total, unit }: { label: string; done: number; total: number; unit: string }) {
  const complete = done >= total && total > 0;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 ${
          complete ? 'bg-[var(--color-success)] border-[var(--color-success)]' : 'border-gray-300'
        }`}
      >
        {complete && <Check size={12} color="white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${complete ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{label}</div>
      </div>
      <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
        {Math.min(done, total)}/{total} {unit}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = useAppStore((s) => s.stats);
  const progress = useAppStore((s) => s.progress);
  const englishLevel = useAppStore((s) => s.stats.englishLevel);
  const getMasteredCount = useAppStore((s) => s.getMasteredCount);
  const getDueIdioms = useAppStore((s) => s.getDueIdioms);
  const getTodayActivity = useAppStore((s) => s.getTodayActivity);
  const getWeeklyActivity = useAppStore((s) => s.getWeeklyActivity);
  const getWeakCategories = useAppStore((s) => s.getWeakCategories);

  const mastered = getMasteredCount();
  const due = getDueIdioms();
  const today = getTodayActivity();
  const weekly = getWeeklyActivity();
  const weak = getWeakCategories();

  const newIdiomsGoal = stats.dailyGoal <= 5 ? 3 : 5;
  const nextNewIdiom = useMemo(
    () => buildNewIdiomsQueue({ progress, englishLevel }, 1)[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const newIdiomsDoneToday = Math.min(today.idiomsLearned, newIdiomsGoal);
  const reviewsGoal = Math.max(due.length, today.reviewsCompleted);
  const speakingDone = today.speakingSessions > 0;

  const continueTarget: { label: string; route: string } | null = newIdiomsDoneToday < newIdiomsGoal && nextNewIdiom
    ? { label: nextNewIdiom.idiom, route: '/learn' }
    : due.length > 0
    ? { label: due[0].idiom, route: '/practice' }
    : null;

  const weeklyXp = weekly.map((d) => d.xpEarned);
  const weeklyIdioms = weekly.map((d) => d.idiomsLearned);
  const weeklyReviews = weekly.map((d) => d.reviewsCompleted);
  const weeklySpeaking = weekly.map((d) => d.speakingSessions);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{greeting()} 👋</h1>
        <p className="text-gray-500 mt-1">
          Сегодня изучим {Math.max(0, newIdiomsGoal - newIdiomsDoneToday)} новых идиом, {due.length} повторений
          {!speakingDone ? ', 1 Speaking Challenge' : ''}.
        </p>
      </motion.div>

      <Card className="p-6 md:p-8">
        <div className="text-xs font-bold uppercase text-gray-400 mb-2">Продолжить обучение</div>
        {continueTarget ? (
          <>
            <p className="text-sm text-gray-500 mb-1">Следующая идиома:</p>
            <h2 className="text-2xl font-extrabold text-gray-900 uppercase mb-5">{continueTarget.label}</h2>
            <Button size="lg" onClick={() => navigate(continueTarget.route)}>
              Продолжить <ArrowRight size={18} />
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Всё выполнено на сегодня! 🎉</h2>
            <p className="text-sm text-gray-500 mb-5">Можете позаниматься ещё, если есть время.</p>
            <Button size="lg" variant="secondary" onClick={() => navigate('/practice')}>
              Дополнительная практика
            </Button>
          </>
        )}
      </Card>

      <Card className="p-6">
        <div className="font-bold text-gray-900 mb-1">Сегодня</div>
        <div className="divide-y divide-gray-50">
          <ChecklistItem label="Новые идиомы" done={newIdiomsDoneToday} total={newIdiomsGoal} unit="" />
          <ChecklistItem label="Повторения" done={today.reviewsCompleted} total={reviewsGoal || 1} unit="" />
          <ChecklistItem label="Speaking Challenge" done={speakingDone ? 1 : 0} total={1} unit="" />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile icon={<Flame size={20} />} label="Серия дней" value={stats.currentStreak} color="#F59E0B" />
        <StatTile icon={<Star size={20} />} label="Всего XP" value={stats.xp} color="#635BFF" />
        <StatTile icon={<Brain size={20} />} label="Освоено идиом" value={mastered} color="#22C55E" />
        <StatTile icon={<Target size={20} />} label="Цель на сегодня" value={stats.dailyGoal} color="#EF4444" />
      </div>

      {weak.length > 0 && (
        <Card className="p-6">
          <div className="font-bold text-gray-900 mb-4">Слабые категории</div>
          <div className="space-y-3">
            {weak.slice(0, 3).map((w) => (
              <div key={w.category} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-32 shrink-0 truncate">{w.category}</span>
                <div className="flex-1"><ProgressBar value={w.accuracy} color={w.accuracy < 60 ? 'var(--color-danger)' : 'var(--color-warning)'} height={7} /></div>
                <span className="text-sm font-bold text-gray-500 w-10 text-right">{w.accuracy}%</span>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => navigate(`/practice?category=${encodeURIComponent(weak[0].category)}`)}
          >
            Review weak category
          </Button>
        </Card>
      )}

      <div>
        <div className="font-bold text-gray-900 mb-3">Недельная аналитика</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniSparkline data={weeklyXp} color="#635BFF" icon="⭐" label="XP" total={weeklyXp.reduce((a, b) => a + b, 0)} />
          <MiniSparkline data={weeklyIdioms} color="#22C55E" icon="🎓" label="Новые идиомы" total={weeklyIdioms.reduce((a, b) => a + b, 0)} />
          <MiniSparkline data={weeklyReviews} color="#F59E0B" icon="🔁" label="Повторения" total={weeklyReviews.reduce((a, b) => a + b, 0)} />
          <MiniSparkline data={weeklySpeaking} color="#EF4444" icon="🎤" label="Speaking" total={weeklySpeaking.reduce((a, b) => a + b, 0)} />
        </div>
      </div>
    </div>
  );
}
