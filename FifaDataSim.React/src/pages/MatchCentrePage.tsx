import { useState } from 'react';
import type { GroupState } from '../types/groupState';
import type { MatchFixture } from '../types/matchFixture';
import type { TournamentSession } from '../types/tournamentSession';

interface MatchCentreProps {
  session: TournamentSession;
  onSessionUpdate: (updatedSession: TournamentSession) => void;
  onNavigateToKnockout: () => void;
}

export default function MatchCentrePage({ session, onSessionUpdate, onNavigateToKnockout }: MatchCentreProps) {
  const [activeMatchday, setActiveMatchday] = useState<number>(1);
  const [simulating, setSimulating] = useState<boolean>(false);

  // Check if all 36 group fixtures are complete
  const isGroupStageComplete = session.fixtures.length > 0 && session.fixtures.every((f) => f.isPlayed);

  // Trigger a single fixture simulation execution loop
  const simulateMatch = async (fixtureId: string) => {
    try {
      const res = await fetch(`http://localhost:5002/api/tournament/fixtures/${fixtureId}/simulate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Match simulation failed');
      
      // Fetch fresh session to trigger state recalculations automatically
      const refreshRes = await fetch('http://localhost:5002/api/tournament/current-session');
      const updatedData = await refreshRes.json();
      onSessionUpdate(updatedData);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger bulk execution loop across all unplayed fixtures
  const simulateAllUnplayed = async () => {
    setSimulating(true);
    try {
      const res = await fetch('http://localhost:5002/api/tournament/fixtures/simulate-all', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Bulk calculation failure');
      const updatedSession = await res.json();
      onSessionUpdate(updatedSession);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const filteredFixtures = session.fixtures.filter((f: MatchFixture) => f.matchday === activeMatchday);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Completion Banner for Group Stage */}
      {isGroupStageComplete && (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h3 className="text-md font-extrabold text-emerald-400 uppercase tracking-wide">Group Stage Concluded!</h3>
            <p className="text-xs text-slate-400 mt-0.5">All 36 group fixtures are finished. Top 2 per group + 8 best 3rd place teams qualify.</p>
          </div>
          <button
            onClick={onNavigateToKnockout}
            className="mt-3 sm:mt-0 w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3 px-6 rounded-lg uppercase tracking-wider shadow-lg transition-transform active:scale-95 animate-bounce flex items-center justify-center space-x-2"
          >
            <span>Proceed to Knockout Bracket</span>
            <span>➔</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Fixture List Schedule Management (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight uppercase">Match Schedule</h2>
              <p className="text-xs text-slate-400 mt-0.5">Track and simulate matchday progression blocks.</p>
            </div>
            <button
              onClick={simulateAllUnplayed}
              disabled={simulating || isGroupStageComplete}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-lg shadow uppercase tracking-wider transition-all"
            >
              {simulating ? 'Simulating...' : isGroupStageComplete ? 'Group Stage Done' : 'Simulate All'}
            </button>
          </div>

          {/* Matchday Selector Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            {[1, 2, 3].map((md) => (
              <button
                key={md}
                onClick={() => setActiveMatchday(md)}
                className={`flex-1 text-center py-2 text-sm font-bold rounded-md transition-all ${
                  activeMatchday === md ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Matchday {md}
              </button>
            ))}
          </div>

          {/* Fixtures Feed Cards */}
          <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
            {filteredFixtures.map((fixture: MatchFixture) => (
              <div key={fixture.id} className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between shadow group hover:border-slate-700/60 transition-colors">
                <div className="flex-1 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded text-slate-500">
                    Group {fixture.groupName}
                  </span>
                  
                  {/* Score Grid Alignment Layout */}
                  <div className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-5 flex items-center space-x-2.5 min-w-0 justify-end text-right">
                      <span className="text-sm font-semibold truncate text-slate-200">{fixture.homeTeam.name}</span>
                      <img src={fixture.homeTeam.flag_url} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm shrink-0" />
                    </div>
                    
                    <div className="col-span-2 flex justify-center text-center font-mono font-black text-sm bg-slate-950 rounded py-1 px-1.5 border border-slate-800/80">
                      {fixture.isPlayed ? (
                        <span className="text-emerald-400">{fixture.homeScore} - {fixture.awayScore}</span>
                      ) : (
                        <span className="text-slate-600">VS</span>
                      )}
                    </div>

                    <div className="col-span-5 flex items-center space-x-2.5 min-w-0 justify-start">
                      <img src={fixture.awayTeam.flag_url} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm shrink-0" />
                      <span className="text-sm font-semibold truncate text-slate-200">{fixture.awayTeam.name}</span>
                    </div>
                  </div>
                </div>

                {/* Single Sim Action Trigger */}
                {!fixture.isPlayed && (
                  <button
                    onClick={() => simulateMatch(fixture.id)}
                    className="ml-4 p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-lg text-xs transition-colors"
                    title="Simulate Match"
                  >
                    🎲
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: The 12 Live Standings Tables (7 cols) */}
        <div className="lg:col-span-7 space-y-6 max-h-[85vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.groups.map((group: GroupState) => (
              <div key={group.name} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="bg-slate-800/40 border-b border-slate-800 px-4 py-2.5 flex justify-between items-center">
                  <h3 className="font-black text-sm tracking-wide text-white">GROUP {group.name}</h3>
                </div>
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800">
                      <th className="py-2 px-3 w-8 text-center">#</th>
                      <th className="py-2 px-2">Team</th>
                      <th className="py-2 px-1 text-center w-8">P</th>
                      <th className="py-2 px-1 text-center w-8">GD</th>
                      <th className="py-2 px-2 text-right w-10">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 font-medium">
                    {group.standings.map((row, idx) => (
                      <tr key={row.teamId} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                          <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[10px] ${
                            idx < 2 ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : 'text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-200">
                          <div className="flex items-center space-x-2">
                            <img src={row.flagUrl} alt="" className="w-4 h-2.5 object-cover rounded shadow-xs" />
                            <span className="font-semibold truncate max-w-[100px]">{row.teamName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-1 text-center font-mono text-slate-400">{row.played}</td>
                        <td className={`py-2.5 px-1 text-center font-mono ${row.goalDifference > 0 ? 'text-emerald-500' : row.goalDifference < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-white bg-slate-950/20">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}