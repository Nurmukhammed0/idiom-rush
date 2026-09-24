import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, BookOpen, RotateCcw, Mic, TrendingUp, Settings, Flame } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAppStore } from '@/store/useAppStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/idioms', label: 'Idioms', icon: BookOpen },
  { to: '/review', label: 'Review', icon: RotateCcw },
  { to: '/speaking', label: 'Speaking', icon: Mic },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

export function AppShell() {
  const stats = useAppStore((s) => s.stats);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <NavLink to="/dashboard" className="focus-ring rounded-lg">
            <Logo size={30} />
          </NavLink>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `focus-ring flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold">
              <Flame size={16} />
              {stats.currentStreak}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold">
              ⭐ {stats.xp} XP
            </div>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `focus-ring p-2 rounded-full transition-colors ${isActive ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-gray-500 hover:bg-gray-100'}`
              }
              aria-label="Settings"
            >
              <Settings size={20} />
            </NavLink>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex items-stretch">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `focus-ring flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? 'text-[var(--color-primary)]' : 'text-gray-500'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
