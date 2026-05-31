import { useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { CreditsPage } from './pages/CreditsPage';
import { FeaturePanel } from './components/CopilotClinicAutomatioPanel';

type View = 'home' | 'credits';

export default function App() {
  const [view, setView] = useState<View>('home');
  return (
    <AppLayout active={view} onNavigate={setView}>
      {view === 'home' ? <FeaturePanel /> : <CreditsPage />}
    </AppLayout>
  );
}
