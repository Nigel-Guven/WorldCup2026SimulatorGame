import type { MatchFixture } from '../../types/matchFixture';

interface FixtureCardProps {
  fixture: MatchFixture;
  onSimulate: (fixtureId: string) => void;
}

export function FixtureCard({ fixture, onSimulate }: FixtureCardProps) {
  // If either team is missing (a Bye week fixture), render a subtle Bye indicator instead of crashing
  const isBye = !fixture.homeTeam || !fixture.awayTeam;
  const activeTeam = fixture.homeTeam || fixture.awayTeam;

  if (isBye) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center space-x-2">
          {fixture.groupName && (
            <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700/50">
              Group {fixture.groupName}
            </span>
          )}
          {activeTeam?.flag_url && (
            <img src={activeTeam.flag_url} alt="" className="w-4 h-3 object-cover rounded" />
          )}
          <span className="font-semibold text-slate-400">{activeTeam?.name || 'Unknown'}</span>
        </div>
        <span className="bg-slate-950 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase">
          BYE WEEK
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
      {/* Group Badge Header */}
      {fixture.groupName && (
        <div className="mb-2 text-left">
          <span className="inline-block bg-slate-800/80 text-slate-400 font-mono text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700/60 uppercase tracking-wider">
            Group {fixture.groupName}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <img
            src={fixture.homeTeam.flag_url}
            alt=""
            className="w-6 h-4 object-cover rounded shadow-sm"
          />
          <span className="text-sm font-bold text-white truncate">
            {fixture.homeTeam.name}
          </span>
        </div>

        {/* Score / Status */}
        <div className="px-4 text-center">
          {fixture.isPlayed ? (
            <span className="text-sm font-black font-mono text-emerald-400">
              {fixture.homeScore} - {fixture.awayScore}
            </span>
          ) : (
            <button
              onClick={() => onSimulate(fixture.id)}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-xs px-2.5 py-1 rounded border border-slate-700 transition-all"
            >
              VS
            </button>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-end space-x-3 flex-1 min-w-0 text-right">
          <span className="text-sm font-bold text-white truncate">
            {fixture.awayTeam.name}
          </span>
          <img
            src={fixture.awayTeam.flag_url}
            alt=""
            className="w-6 h-4 object-cover rounded shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}