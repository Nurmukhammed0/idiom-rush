import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';
import { ACHIEVEMENTS } from '@/services/achievements';

export default function Achievements() {
  const unlocked = useAppStore((s) => s.unlockedAchievements);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Достижения</h1>
        <p className="text-gray-500 text-sm mt-1">{unlocked.length} из {ACHIEVEMENTS.length} получено</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <Card key={a.id} className={`p-5 flex items-center gap-4 ${!isUnlocked ? 'opacity-50' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${isUnlocked ? 'bg-[var(--color-primary-light)]' : 'bg-gray-100 grayscale'}`}>
                {a.icon}
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">{a.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{a.description}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
