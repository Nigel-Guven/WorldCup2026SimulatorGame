import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import Navbar from './components/layout/Navbar';
import PageRenderer from './components/layout/PageRenderer';
;

export type ActivePage =
  | 'rankings'
  | 'confederations';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('rankings');

  return (
    <AppLayout>
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage} 
      />

      <PageRenderer
        activePage={activePage}
        onNavigate={setActivePage} 
      />
    </AppLayout>
  );
}