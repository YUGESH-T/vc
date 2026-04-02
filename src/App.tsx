import { AppProvider, useApp } from './AppContext';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { profile } = useApp();

  if (!profile) {
    return <Onboarding />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
