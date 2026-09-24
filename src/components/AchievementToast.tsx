import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ACHIEVEMENTS } from '@/services/achievements';

export default function AchievementToast() {
  const newlyUnlocked = useAppStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useAppStore((s) => s.clearNewlyUnlocked);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (newlyUnlocked.length === 0) return;
    setCurrent(newlyUnlocked[0]);
    const t = setTimeout(() => {
      setCurrent(null);
      clearNewlyUnlocked();
    }, 3200);
    return () => clearTimeout(t);
  }, [newlyUnlocked, clearNewlyUnlocked]);

  if (!current) return null;
  const achievement = ACHIEVEMENTS.find((a) => a.id === current);
  if (!achievement) return null;

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white shadow-xl rounded-2xl border border-gray-100 px-5 py-3.5 flex items-center gap-3 pointer-events-none"
      style={{ animation: 'achievementIn 0.4s ease-out' }}
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-xl">{achievement.icon}</div>
      <div>
        <div className="text-xs font-bold uppercase text-[var(--color-primary)]">Достижение получено!</div>
        <div className="font-bold text-gray-900 text-sm">{achievement.title}</div>
      </div>
      <style>{`
        @keyframes achievementIn {
          0% { opacity: 0; transform: translate(-50%, -12px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
