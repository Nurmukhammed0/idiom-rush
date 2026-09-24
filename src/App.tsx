import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';
import Landing from '@/pages/Landing';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Learn from '@/pages/Learn';
import Practice from '@/pages/Practice';
import IdiomsList from '@/pages/IdiomsList';
import IdiomDetail from '@/pages/IdiomDetail';
import Review from '@/pages/Review';
import Speaking from '@/pages/Speaking';
import ProgressPage from '@/pages/Progress';
import Achievements from '@/pages/Achievements';
import Settings from '@/pages/Settings';

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const complete = useAppStore((s) => s.stats.onboardingComplete);
  if (!complete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          element={
            <RequireOnboarding>
              <AppShell />
            </RequireOnboarding>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/idioms" element={<IdiomsList />} />
          <Route path="/idioms/:id" element={<IdiomDetail />} />
          <Route path="/review" element={<Review />} />
          <Route path="/speaking" element={<Speaking />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
