import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Star, Brain, BookMarked, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MasteryBadge } from '@/components/MasteryBadge';
import { useAppStore } from '@/store/useAppStore';
import { IDIOM_BY_ID } from '@/data/idiomsRepository';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = useAppStore((s) => s.stats);
  const progress = useAppStore((s) => s.progress);
  const getMasteredCount = useAppStore((s) => s.getMasteredCount);
  const getDueIdioms = useAppStore((s) => s.getDueIdioms);
  const getTodayActivity = useAppStore((s) => s.getTodayActivity);
  const getWeeklyActivity = useAppStore((s) => s.getWeeklyActivity);

  const mastered = getMasteredCount();
  const due = getDueIdioms();
  const today = getTodayActivity();
  const weekly = getWeeklyActivity();

  const continueLearning = useMemo(() => {
    return Object.values(progress)
      .filter((p) => p.masteryScore > 0 && p.masteryScore < 80)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 3)
      .map((p) => ({ idiom: IDIOM_BY_ID[p.idiomId], progress: p }))
      .filter((x) => x.idiom);
  }, [progress]);

  const chartData = weekly.map((d) => ({
    day: new Date(d.date).toLocaleDateString('ru-RU', { weekday: 'short' }),
    XP: d.xpEarned,
    idioms: d.idiomsLearned,
  }));

  const todayGoalProgress = Math.min(today.idiomsLearned + today.reviewsCompleted, stats.dailyGoal);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{greeting()} 👋</h1>
        <p className="text-gray-500 mt-1">Давайте улучшим ваш английский сегодня.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatTile icon={<Flame size={20} />} label="Серия дней" value={stats.currentStreak} color="#F59E0B" />
        <StatTile icon={<Star size={20} />} label="Всего XP" value={stats.xp} color="#635BFF" />
        <StatTile icon={<Brain size={20} />} label="Освоено идиом" value={mastered} color="#22C55E" />
        <StatTile icon={<BookMarked size={20} />} label="Всего изучено" value={stats.totalIdiomsLearned} color="#635BFF" />
        <StatTile icon={<Target size={20} />} label="Цель на сегодня" value={stats.dailyGoal} color="#EF4444" />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Обучение на сегодня</h2>
          <span className="text-sm font-semibold text-gray-500">{todayGoalProgress} / {stats.dailyGoal}</span>
        </div>
        <ProgressBar value={todayGoalProgress} max={stats.dailyGoal} height={10} />
        <Button className="mt-4" onClick={() => navigate('/practice')}>Продолжить практику</Button>
      </Card>

      {continueLearning.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Продолжить изучение</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {continueLearning.map(({ idiom, progress: p }) => (
              <Card key={idiom!.id} className="p-4 cursor-pointer" onClick={() => navigate(`/idioms/${idiom!.id}`)}>
                <div className="font-bold text-gray-900 uppercase text-sm tracking-tight mb-2">{idiom!.idiom}</div>
                <MasteryBadge score={p.masteryScore} showLabel={false} />
                <ProgressBar value={p.masteryScore} height={6} />
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-bold text-gray-900">Повторение сегодня</h2>
          <p className="text-sm text-gray-500 mt-1">
            {due.length > 0 ? `${due.length} идиом ждут повторения` : 'Всё повторено — отличная работа!'}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/review')}>Перейти к повторению</Button>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 mb-4">Прогресс за неделю</h2>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#635BFF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#635BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 13 }} />
              <Area type="monotone" dataKey="XP" stroke="#635BFF" strokeWidth={2.5} fill="url(#xpGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
