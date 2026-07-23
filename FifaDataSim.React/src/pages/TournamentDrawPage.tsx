import { DrawControls } from '../components/tournamentDraw/DrawControls';
import { DrawTicker } from '../components/tournamentDraw/DrawTicker';
import { GroupCard } from '../components/tournamentDraw/GroupCard';
import { PotCard } from '../components/tournamentDraw/PotCard';
import { useTournamentDraw } from '../hooks/useTournamentDraw';

interface TournamentDrawPageProps {
  onDrawComplete: (groups: { name: string; teams: any[] }[]) => void;
  hasExistingSession: boolean;
}

export default function TournamentDrawPage({ onDrawComplete }: TournamentDrawPageProps) {
  const {
    pots,
    groups,
    currentPotIndex,
    loading,
    error,
    drawHistory,
    isDrawComplete,
    drawNextTeam,
    autoDrawAll,
  } = useTournamentDraw();

  if (loading || !pots) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <p className="text-xl font-medium animate-pulse">
          Assembling global seeding allocations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-red-400">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  const potList = Array.isArray(pots)
    ? pots
    : Object.keys(pots).map((key) => (pots as Record<string, any[]>)[key]);

  const totalTeams = groups.reduce((acc, g) => acc + (g.teams?.length || 0), 0) || 
                     potList.reduce((acc, pot) => acc + (pot?.length || 0), 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in">
      {/* Pots UI Column */}
      <div className="xl:col-span-1 space-y-6">
        <DrawControls
          currentPotIndex={currentPotIndex}
          isDrawComplete={isDrawComplete}
          onDrawNext={drawNextTeam}
          onAutoDraw={autoDrawAll}
        />

        {/* Dynamic pot rendering container */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-1 max-h-[70vh] xl:max-h-[75vh] overflow-y-auto pr-1">
          {potList.map((potTeams, index) => (
            <PotCard
              key={`pot-${index + 1}`}
              potNumber={index + 1}
              teams={potTeams}
              isActive={currentPotIndex === index + 1 && !isDrawComplete}
            />
          ))}
        </div>
      </div>

      {/* Main Groups Visual Box */}
      <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Tournament Groups ({groups.length})
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
              {potList.length} Seeding Pots
            </span>
          </div>

          {/* Dynamic grid column sizing based on number of groups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {groups.map((group) => (
              <GroupCard key={group.name} group={group} />
            ))}
          </div>
        </div>

        <DrawTicker history={drawHistory} />

        {/* Action Lock Bar Trigger on Completion */}
        {isDrawComplete && (
          <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between shadow-2xl mt-6">
            <div>
              <h3 className="text-md font-bold text-emerald-400 uppercase tracking-wide">
                Draw Sequence Concluded!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All {totalTeams || 'qualifying'} federations are successfully seeded into their group stage containers.
              </p>
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