import { useEffect, useState } from 'react';

export function XpFloat({ amount, trigger }: { amount: number; trigger: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!visible || amount <= 0) return null;

  return (
    <div
      className="fixed top-20 right-6 z-50 px-3 py-1.5 rounded-full bg-[var(--color-success)] text-white text-sm font-bold shadow-lg pointer-events-none"
      style={{ animation: 'xpFloatUp 1s ease-out forwards' }}
    >
      +{amount} XP
      <style>{`
        @keyframes xpFloatUp {
          0% { opacity: 0; transform: translateY(10px); }
          15% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
