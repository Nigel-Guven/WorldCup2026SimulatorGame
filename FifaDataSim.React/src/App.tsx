import { useState, useEffect } from 'react';
import type { TournamentSession } from './types/tournamentSession';
import RankingsPage from './pages/RankingsPage';
import TournamentDrawPage from './pages/TournamentDrawPage';
import MatchCentrePage from './pages/MatchCentrePage';

type ActivePage = 'rankings' | 'draw' | 'centre';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('rankings');
  const [session, setSession] = useState<TournamentSession | null>(null);

  // Auto-load session context on page reload if one is active in backend memory
  useEffect(() => {
    fetch('http://localhost:5002/api/tournament/current-session')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('No running profile context found');
      })
      .then((data: TournamentSession) => {
        setSession(data);
      })
      .catch(() => {});
  }, []);

  // Accept drawn groups layout from TournamentDrawPage and lock it into backend state
  const handleLockInGroups = async (drawnGroups: { name: string; teams: any[] }[]) => {
    try {
      const res = await fetch('http://localhost:5002/api/tournament/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drawnGroups),
      });

      if (!res.ok) throw new Error('Failed to initialize tournament workspace scheduling configurations');
      
      const sessionData: TournamentSession = await res.json();
      setSession(sessionData);
      setActivePage('centre');
    } catch (err) {
      console.error(err);
      alert('Error allocating scheduling context.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Navbar Framework */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-black tracking-wider text-emerald-400 uppercase">
                🏆 World Cup Sim
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setActivePage('rankings')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activePage === 'rankings' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Global Rankings
              </button>
              
              <button
                onClick={() => setActivePage('draw')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activePage === 'draw' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Tournament Draw
              </button>

              {session && (
                <button
                  onClick={() => setActivePage('centre')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activePage === 'centre' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/10'
                  }`}
                >
                  Match Centre ⚽
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container Core Viewports */}
      <main className="max-w-[1600px] mx-auto p-6 sm:p-8">
        {activePage === 'rankings' && <RankingsPage />}
        
        {activePage === 'draw' && (
          <TournamentDrawPage 
            onDrawComplete={handleLockInGroups} 
            hasExistingSession={!!session}
          />
        )}
        
        {activePage === 'centre' && session && (
          <MatchCentrePage 
            session={session} 
            onSessionUpdate={setSession} 
          />
        )}
      </main>

    </div>
  );
}