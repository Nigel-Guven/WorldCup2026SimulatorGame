import { DrawControls } from '../components/tournamentDraw/DrawControls';
import { DrawTicker } from '../components/tournamentDraw/DrawTicker';
import { GroupCard } from '../components/tournamentDraw/GroupCard';
import { PotCard } from '../components/tournamentDraw/PotCard';
import { useTournamentDraw, type PotKey } from '../hooks/useTournamentDraw';

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

  const potKeys: PotKey[] = ['pot1', 'pot2', 'pot3', 'pot4'];

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

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
          {potKeys.map((key: PotKey, index: number) => (
            <PotCard
              key={key}
              potNumber={index + 1}
              teams={pots[key]}
              isActive={currentPotIndex === index + 1 && !isDrawComplete}
            />
          ))}
        </div>
      </div>

      {/* Main Groups Visual Box */}
      <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
            Tournament Groups
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                All 48 federations are successfully seeded into their group stage containers.
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