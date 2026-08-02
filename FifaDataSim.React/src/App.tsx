import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import Navbar from './components/layout/Navbar';
import PageRenderer from './components/layout/PageRenderer';
import { useTournamentSession } from './hooks/useTournamentSession';

export type ActivePage =
  | 'rankings'
  | 'draw'
  | 'drawv2'
  | 'centre'
  | 'knockout';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('rankings');

  const {
    session,
    setSession,
    initializeTournament,
  } = useTournamentSession();

  return (
    <AppLayout>
      <Navbar
        activePage={activePage}
        hasSession={session !== null}
        onNavigate={setActivePage}
      />

      <PageRenderer
        activePage={activePage}
        session={session}
        onSessionUpdate={setSession}
        onDrawComplete={initializeTournament}
        onNavigate={setActivePage}
      />
    </AppLayout>
  );
}