import { useAppStore } from '@/store/useAppStore';

export function StreakCalendar() {
  const dailyActivity = useAppStore((s) => s.dailyActivity);

  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    const key = d.toISOString().slice(0, 10);
    const active = !!dailyActivity[key] && (dailyActivity[key].reviewsCompleted > 0 || dailyActivity[key].idiomsLearned > 0);
    return { key, active, label: d.getDate() };
  });

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => (
        <div
          key={d.key}
          title={d.key}
          className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold ${
            d.active ? 'bg-[var(--color-success)] text-white' : 'bg-gray-100 text-gray-400'
          }`}
        >
          {d.label}
        </div>
      ))}
    </div>
  );
}
