import { motion } from 'framer-motion';
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a, i) => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card className={`p-6 text-center h-full ${!isUnlocked ? 'opacity-45' : ''}`}>
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4 ${
                    isUnlocked ? 'bg-[var(--color-primary-light)]' : 'bg-gray-100 grayscale'
                  }`}
                >
                  {a.icon}
                </div>
                <div className="font-bold text-gray-900 mb-1">{a.title}</div>
                <div className="text-sm text-gray-500">{a.description}</div>
                {!isUnlocked && <div className="text-[11px] font-semibold text-gray-300 uppercase mt-3">Заблокировано</div>}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
