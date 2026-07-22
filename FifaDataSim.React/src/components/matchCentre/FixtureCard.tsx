import type { MatchFixture } from "../../types/matchFixture";

interface FixtureCardProps {
  fixture: MatchFixture;
  onSimulate: (fixtureId: string) => void;
}

export function FixtureCard({ fixture, onSimulate }: FixtureCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between shadow group hover:border-slate-700/60 transition-colors">
      <div className="flex-1 space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded text-slate-500">
          Group {fixture.groupName}
        </span>

        <div className="grid grid-cols-12 items-center gap-2">
          {/* Home Team */}
          <div className="col-span-5 flex items-center space-x-2.5 min-w-0 justify-end text-right">
            <span className="text-sm font-semibold truncate text-slate-200">
              {fixture.homeTeam.name}
            </span>
            <img
              src={fixture.homeTeam.flag_url}
              alt=""
              className="w-5 h-3.5 object-cover rounded shadow-sm shrink-0"
            />
          </div>

          {/* Score Box */}
          <div className="col-span-2 flex justify-center text-center font-mono font-black text-sm bg-slate-950 rounded py-1 px-1.5 border border-slate-800/80">
            {fixture.isPlayed ? (
              <span className="text-emerald-400">
                {fixture.homeScore} - {fixture.awayScore}
              </span>
            ) : (
              <span className="text-slate-600">VS</span>
            )}
          </div>

          {/* Away Team */}
          <div className="col-span-5 flex items-center space-x-2.5 min-w-0 justify-start">
            <img
              src={fixture.awayTeam.flag_url}
              alt=""
              className="w-5 h-3.5 object-cover rounded shadow-sm shrink-0"
            />
            <span className="text-sm font-semibold truncate text-slate-200">
              {fixture.awayTeam.name}
            </span>
          </div>
        </div>
      </div>

      {!fixture.isPlayed && (
        <button
          onClick={() => onSimulate(fixture.id)}
          className="ml-4 p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-lg text-xs transition-colors"
          title="Simulate Match"
        >
          🎲
        </button>
      )}
    </div>
  );
}