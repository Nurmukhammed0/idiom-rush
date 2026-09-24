import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Gamepad2,
  BookOpen,
  Mic,
  RotateCcw,
  TrendingUp,
  Trophy,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Flame,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAppStore } from '@/store/useAppStore';
import AchievementToast from '@/components/AchievementToast';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/learn', label: 'Learn', icon: GraduationCap },
  { to: '/practice', label: 'Practice', icon: Gamepad2 },
  { to: '/idioms', label: 'Idioms', icon: BookOpen },
  { to: '/speaking', label: 'Speaking', icon: Mic },
  { to: '/review', label: 'Review', icon: RotateCcw },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/learn', label: 'Learn', icon: GraduationCap },
  { to: '/practice', label: 'Practice', icon: Gamepad2 },
  { to: '/speaking', label: 'Speaking', icon: Mic },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

export function AppShell() {
  const stats = useAppStore((s) => s.stats);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      <AchievementToast />

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col shrink-0 border-r border-gray-100 bg-white sticky top-0 h-screen transition-[width] ease-out"
        style={{ width: collapsed ? 76 : 240, transitionDuration: '250ms' }}
      >
        <div className={`flex items-center h-16 shrink-0 ${collapsed ? 'justify-center' : 'justify-between px-5'}`}>
          {!collapsed && <Logo size={28} />}
          {collapsed && (
            <svg width={28} height={28} viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="#635BFF" />
              <path d="M35 18L24 32H31L29 46L42 28H34L35 18Z" fill="white" />
            </svg>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-2.5'
                } ${isActive ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <Icon size={19} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`px-3 pb-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-1 pb-2 mb-2 border-b border-gray-100">
              <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 rounded-full px-2 py-1">
                <Flame size={13} /> {stats.currentStreak}
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-full px-2 py-1">
                ⭐ {stats.xp} XP
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!collapsed)}
            className="focus-ring w-full flex items-center justify-center gap-2 py-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 h-14 flex items-center justify-between px-4">
        <Logo size={26} />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 rounded-full px-2 py-1">
            <Flame size={13} /> {stats.currentStreak}
          </div>
          <NavLink to="/settings" className="focus-ring p-1.5 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Settings">
            <Settings size={19} />
          </NavLink>
        </div>
      </header>

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 pt-20 md:pt-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `focus-ring flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? 'text-[var(--color-primary)]' : 'text-gray-500'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
