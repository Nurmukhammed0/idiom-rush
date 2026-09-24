import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { IDIOMS } from '@/data/idiomsRepository';
import { LEVELS } from '@/data/idiomsRepository';

const PIE_COLORS = ['#635BFF', '#22C55E', '#F59E0B', '#EF4444', '#6B7280'];

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </Card>
  );
}

export default function ProgressPage() {
  const navigate = useNavigate();
  const stats = useAppStore((s) => s.stats);
  const progress = useAppStore((s) => s.progress);
  const reviewLog = useAppStore((s) => s.reviewLog);
  const speakingAttempts = useAppStore((s) => s.speakingAttempts);
  const getMasteredCount = useAppStore((s) => s.getMasteredCount);
  const getWeeklyActivity = useAppStore((s) => s.getWeeklyActivity);
  const getWeakCategories = useAppStore((s) => s.getWeakCategories);
  const getDueIdioms = useAppStore((s) => s.getDueIdioms);

  const mastered = getMasteredCount();
  const learning = Object.values(progress).filter((p) => p.masteryScore > 0 && p.masteryScore < 80).length;
  const due = getDueIdioms().length;
  const weekly = getWeeklyActivity();
  const weak = getWeakCategories();

  const accuracy = useMemo(() => {
    if (reviewLog.length === 0) return 0;
    return Math.round((reviewLog.filter((r) => r.correct).length / reviewLog.length) * 100);
  }, [reviewLog]);

  const speakingAccuracy = useMemo(() => {
    if (speakingAttempts.length === 0) return 0;
    return Math.round(speakingAttempts.reduce((sum, a) => sum + a.overallScore, 0) / speakingAttempts.length);
  }, [speakingAttempts]);

  const avgResponseTime = useMemo(() => {
    if (reviewLog.length === 0) return 0;
    return Math.round(reviewLog.reduce((sum, r) => sum + r.responseTimeMs, 0) / reviewLog.length / 100) / 10;
  }, [reviewLog]);

  const weeklyChart = weekly.map((d) => ({
    day: new Date(d.date).toLocaleDateString('ru-RU', { weekday: 'short' }),
    XP: d.xpEarned,
    Повторения: d.reviewsCompleted,
    Речь: d.speakingSessions,
  }));

  const levelDistribution = LEVELS.map((level) => ({
    name: level,
    value: IDIOMS.filter((i) => progress[i.id] && i.level === level).length,
  })).filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Прогресс</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/achievements')}>
          <Trophy size={16} /> Достижения
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Всего изучено" value={stats.totalIdiomsLearned} />
        <StatBox label="Освоено" value={mastered} />
        <StatBox label="Изучается" value={learning} />
        <StatBox label="На повторении" value={due} />
        <StatBox label="Точность" value={`${accuracy}%`} />
        <StatBox label="Точность речи" value={`${speakingAccuracy}%`} />
        <StatBox label="Ср. время ответа" value={`${avgResponseTime}с`} />
        <StatBox label="Лучшая серия" value={stats.longestStreak} />
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 mb-4">Активность за неделю</h2>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={weeklyChart} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 13 }} />
              <Bar dataKey="XP" fill="#635BFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-bold text-gray-900 mb-4">Распределение по уровням</h2>
          {levelDistribution.length === 0 ? (
            <p className="text-sm text-gray-400">Пока нет данных.</p>
          ) : (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={levelDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {levelDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-bold text-gray-900 mb-4">Слабые места</h2>
          {weak.length === 0 ? (
            <p className="text-sm text-gray-400">Недостаточно данных для анализа.</p>
          ) : (
            <div className="space-y-3">
              {weak.slice(0, 5).map((w) => (
                <div key={w.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{w.category}</span>
                    <span className="font-bold" style={{ color: w.accuracy < 60 ? 'var(--color-danger)' : 'var(--color-warning)' }}>{w.accuracy}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${w.accuracy}%`, backgroundColor: w.accuracy < 60 ? 'var(--color-danger)' : 'var(--color-warning)' }} />
                  </div>
                </div>
              ))}
              {weak[0] && (
                <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  💡 Рекомендуем повторить идиомы из категории "{weak[0].category}" сегодня.
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
