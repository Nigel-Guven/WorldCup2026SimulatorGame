import { useEffect, useState } from 'react';
import KnockoutMatchCard from './KnockoutMatchCard';
import type { KnockoutBracket } from '../types/KnockoutBracket';

export default function KnockoutBracketPage() {
  const [bracket, setBracket] = useState<KnockoutBracket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL'>('ALL');

  useEffect(() => {
    fetchBracket();
  }, []);

  const fetchBracket = async () => {
    try {
      // Initialize or fetch existing bracket
      const res = await fetch('http://localhost:5002/api/tournament/knockout/generate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBracket(data);
      }
    } catch (err) {
      console.error("Failed to load bracket", err);
    } finally {
      setLoading(false);
    }
  };

  const simulateMatch = async (matchId: string) => {
    try {
      const res = await fetch(`http://localhost:5002/api/tournament/knockout/simulate-match/${matchId}`, { method: 'POST' });
      if (res.ok) {
        const updatedBracket = await res.json();
        setBracket(updatedBracket);
      }
    } catch (err) {
      console.error("Failed to simulate knockout match", err);
    }
  };

  if (loading || !bracket) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <p className="text-xl font-medium animate-pulse text-emerald-400">Initializing Round of 32 Seeding...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Champion / Banner Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Knockout Stage</h1>
          <p className="text-xs text-slate-400 mt-1">Single-elimination tree from Round of 32 down to the World Cup Final.</p>
        </div>

        {bracket.champion && (
          <div className="mt-4 md:mt-0 bg-emerald-950 border border-emerald-500 px-6 py-3 rounded-xl flex items-center space-x-4 shadow-2xl animate-bounce">
            <span className="text-3xl">🏆</span>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">World Cup Champion</span>
              <div className="flex items-center space-x-2">
                <img src={bracket.champion.flag_url} alt="" className="w-6 h-4 object-cover rounded" />
                <span className="text-xl font-black text-white">{bracket.champion.name}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {(['ALL', 'R32', 'R16', 'QF', 'SF', 'FINAL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab === 'ALL' ? 'Full Bracket' : tab}
          </button>
        ))}
      </div>

      {/* Bracket Tree Container */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-6 shadow-2xl overflow-x-auto min-h-[600px]">
        <div className="flex space-x-12 min-w-max items-center justify-center">
          
          {/* Round of 32 */}
          {(activeTab === 'ALL' || activeTab === 'R32') && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 text-center uppercase tracking-widest mb-4">Round of 32</h3>
              <div className="grid grid-cols-1 gap-4">
                {bracket.roundOf32.map((match) => (
                  <KnockoutMatchCard key={match.id} match={match} onSimulateMatch={simulateMatch} />
                ))}
              </div>
            </div>
          )}

          {/* Round of 16 */}
          {(activeTab === 'ALL' || activeTab === 'R16') && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 text-center uppercase tracking-widest mb-4">Round of 16</h3>
              <div className="flex flex-col justify-around h-full space-y-16">
                {bracket.roundOf16.map((match) => (
                  <KnockoutMatchCard key={match.id} match={match} onSimulateMatch={simulateMatch} />
                ))}
              </div>
            </div>
          )}

          {/* Quarter Finals */}
          {(activeTab === 'ALL' || activeTab === 'QF') && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 text-center uppercase tracking-widest mb-4">Quarter Finals</h3>
              <div className="flex flex-col justify-around h-full space-y-32">
                {bracket.quarterFinals.map((match) => (
                  <KnockoutMatchCard key={match.id} match={match} onSimulateMatch={simulateMatch} />
                ))}
              </div>
            </div>
          )}

          {/* Semi Finals */}
          {(activeTab === 'ALL' || activeTab === 'SF') && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 text-center uppercase tracking-widest mb-4">Semi Finals</h3>
              <div className="flex flex-col justify-around h-full space-y-64">
                {bracket.semiFinals.map((match) => (
                  <KnockoutMatchCard key={match.id} match={match} onSimulateMatch={simulateMatch} />
                ))}
              </div>
            </div>
          )}

          {/* Final & 3rd Place Match */}
          {(activeTab === 'ALL' || activeTab === 'FINAL') && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-mono font-bold text-amber-400 text-center uppercase tracking-widest mb-4">👑 World Cup Final</h3>
                <KnockoutMatchCard match={bracket.final} onSimulateMatch={simulateMatch} />
              </div>

              <div>
                <h3 className="text-xs font-mono font-bold text-slate-500 text-center uppercase tracking-widest mb-4">3rd Place Match</h3>
                <KnockoutMatchCard match={bracket.thirdPlaceMatch} onSimulateMatch={simulateMatch} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}