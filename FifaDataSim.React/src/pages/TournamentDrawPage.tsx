import { useEffect, useState } from 'react';
import type { Country } from '../types/country';

interface DrawSetup {
  pot1: Country[];
  pot2: Country[];
  pot3: Country[];
  pot4: Country[];
}

interface TournamentDrawPageProps {
  onDrawComplete: (groups: { name: string; teams: any[] }[]) => void;
  hasExistingSession: boolean;
}

interface Group {
  name: string;
  teams: Country[];
}

export default function TournamentDrawPage({ onDrawComplete, hasExistingSession }: TournamentDrawPageProps) {
  const [pots, setPots] = useState<DrawSetup | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentPotIndex, setCurrentPotIndex] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [drawHistory, setDrawHistory] = useState<string[]>([]);

  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  useEffect(() => {
    fetch('http://localhost:5002/api/tournament/draw-setup')
      .then((res) => res.json())
      .then((data: DrawSetup) => {
        setPots(data);
        setGroups(groupNames.map((name) => ({ name, teams: [] })));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const drawNextTeam = () => {
    if (!pots) return;
    let activePotKey: 'pot1' | 'pot2' | 'pot3' | 'pot4' = 'pot1';
    if (currentPotIndex === 1) activePotKey = 'pot1';
    else if (currentPotIndex === 2) activePotKey = 'pot2';
    else if (currentPotIndex === 3) activePotKey = 'pot3';
    else if (currentPotIndex === 4) activePotKey = 'pot4';

    const activePot = pots[activePotKey];
    if (activePot.length === 0) return;

    const targetGroupIndex = groups.findIndex((g) => g.teams.length === currentPotIndex - 1);
    if (targetGroupIndex === -1) return;

    const randomIdx = Math.floor(Math.random() * activePot.length);
    const selectedTeam = activePot[randomIdx];
    const updatedPot = activePot.filter((_, idx) => idx !== randomIdx);
    
    const updatedGroups = [...groups];
    updatedGroups[targetGroupIndex].teams.push(selectedTeam);

    setPots({ ...pots, [activePotKey]: updatedPot });
    setGroups(updatedGroups);
    setDrawHistory((prev) => [
      `Drew ${selectedTeam.name} (${selectedTeam.short_name}) into Group ${groups[targetGroupIndex].name}`,
      ...prev,
    ]);

    const totalTeamsInCurrentLayer = updatedGroups.filter((g) => g.teams.length === currentPotIndex).length;
    if (totalTeamsInCurrentLayer === 12 && currentPotIndex < 4) {
      setCurrentPotIndex((prev) => prev + 1);
    }
  };

  // Instant simulation helper to fill out remaining allocations
  const autoDrawAll = () => {
    if (!pots) return;

    let currentPots = { ...pots };
    let currentGroups = [...groups.map((g) => ({ ...g, teams: [...g.teams] }))];
    let potIdx = currentPotIndex;
    let historyLogs: string[] = [];

    while (potIdx <= 4) {
      let activePotKey: 'pot1' | 'pot2' | 'pot3' | 'pot4' = `pot${potIdx}` as any;
      let activePot = [...currentPots[activePotKey]];

      while (activePot.length > 0) {
        const targetGroupIndex = currentGroups.findIndex((g) => g.teams.length === potIdx - 1);
        if (targetGroupIndex === -1) break;

        const randomIdx = Math.floor(Math.random() * activePot.length);
        const selectedTeam = activePot[randomIdx];
        activePot.splice(randomIdx, 1);

        currentGroups[targetGroupIndex].teams.push(selectedTeam);
        historyLogs.unshift(`Drew ${selectedTeam.name} into Group ${currentGroups[targetGroupIndex].name}`);
      }

      currentPots[activePotKey] = [];
      potIdx++;
    }

    setPots(currentPots);
    setGroups(currentGroups);
    setCurrentPotIndex(4);
    setDrawHistory((prev) => [...historyLogs, ...prev]);
  };

  const isDrawComplete = pots ? (pots.pot1.length === 0 && pots.pot2.length === 0 && pots.pot3.length === 0 && pots.pot4.length === 0) : false;

  if (loading || !pots) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <p className="text-xl font-medium animate-pulse">Assembling global seeding allocations...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in">
      {/* Pots UI Column */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">World Cup Draw</h1>
          <p className="text-xs text-slate-400 mt-1 mb-4">48 Qualified Teams partitioned by Seeding Points.</p>

          <div className="space-y-2">
            <button
              onClick={drawNextTeam}
              disabled={isDrawComplete}
              className={`w-full py-3 px-4 font-bold rounded-lg shadow transition-all duration-200 uppercase tracking-wider text-sm ${
                isDrawComplete
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 transform active:scale-98'
              }`}
            >
              {isDrawComplete ? 'Draw Concluded' : `Draw Team (Pot ${currentPotIndex})`}
            </button>

            {!isDrawComplete && (
              <button
                onClick={autoDrawAll}
                className="w-full py-2 px-4 font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs uppercase tracking-wider transition-colors"
              >
                ⚡ Auto-Complete Draw
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
          {(['pot1', 'pot2', 'pot3', 'pot4'] as const).map((key, index) => (
            <div key={key} className={`bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm ${currentPotIndex === index + 1 && !isDrawComplete ? 'ring-2 ring-emerald-500' : ''}`}>
              <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1.5">
                <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Pot {index + 1}</h3>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">{pots[key].length} left</span>
              </div>
              <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto text-xs">
                {pots[key].map((team) => (
                  <div key={team.id} className="flex items-center space-x-2 bg-slate-950/40 px-2 py-1.5 rounded border border-slate-800/40">
                    <img src={team.flag_url} alt="" className="w-5 h-3.5 object-cover rounded" />
                    <span className="truncate text-slate-300 font-medium">{team.name}</span>
                  </div>
                ))}
                {pots[key].length === 0 && <p className="text-slate-500 italic text-center py-2">All teams allocated</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Groups Visual Box */}
      <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Tournament Groups</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {groups.map((group) => (
              <div key={group.name} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 min-h-48 flex flex-col justify-between">
                <div>
                  <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 rounded-t-lg -mx-4 -mt-4 mb-3 flex justify-between items-center">
                    <span className="font-black text-slate-200">GROUP {group.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{group.teams.length}/4</span>
                  </div>
                  <div className="space-y-2">
                    {group.teams.map((team, idx) => (
                      <div key={team.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-800/50 rounded-lg p-2 group">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="text-xs font-mono font-bold text-slate-600 w-3">{idx + 1}</span>
                          <img src={team.flag_url} alt="" className="w-5 h-3.5 object-cover rounded" />
                          <span className="text-sm font-semibold text-white truncate">{team.name}</span>
                        </div>
                        <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-400">
                          {team.default_points}
                        </span>
                      </div>
                    ))}
                    {Array.from({ length: 4 - group.teams.length }).map((_, idx) => (
                      <div key={idx} className="border border-dashed border-slate-800/60 rounded-lg py-3 text-center text-xs text-slate-700 font-mono italic">
                        Slot {group.teams.length + idx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Draw Ticker Feed */}
        <div className="mt-6 border-t border-slate-800 pt-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Live Draw Ticker Feed</h4>
          <div className="bg-slate-950 rounded-lg p-3 h-16 overflow-y-auto text-xs font-mono text-slate-400 divide-y divide-slate-900">
            {drawHistory.map((log, i) => (
              <p key={i} className={`py-1 ${i === 0 ? 'text-emerald-400 font-bold' : ''}`}>{log}</p>
            ))}
          </div>
        </div>

        {/* Action Lock Bar Trigger on Completion */}
        {isDrawComplete && (
          <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between shadow-2xl mt-6">
            <div>
              <h3 className="text-md font-bold text-emerald-400 uppercase tracking-wide">Draw Sequence Concluded!</h3>
              <p className="text-xs text-slate-400 mt-0.5">All 48 federations are successfully seeded into their group stage containers.</p>
            </div>
            <button
              onClick={() => onDrawComplete(groups)}
              className="mt-3 sm:mt-0 w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm py-3 px-6 rounded-lg uppercase tracking-wider shadow-lg transition-transform active:scale-95"
            >
              Lock Schedules & Go To Match Centre →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}