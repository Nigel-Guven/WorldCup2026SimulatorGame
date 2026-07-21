import type { KnockoutMatch } from "../types/knockoutMatch";

interface KnockoutMatchCardProps {
  match: KnockoutMatch;
  onSimulateMatch: (matchId: string) => void;
}

export default function KnockoutMatchCard({ match, onSimulateMatch }: KnockoutMatchCardProps) {
  const isReadyToPlay = match.homeTeam && match.awayTeam && !match.isPlayed;

  const renderScore = (isHome: boolean) => {
    if (!match.isPlayed) return '-';
    if (match.wentToExtraTime && match.homeExtraScore !== null && match.awayExtraScore !== null) {
      return isHome ? match.homeExtraScore : match.awayExtraScore;
    }
    return isHome ? match.homeScore : match.awayScore;
  };

  return (
    <div className={`bg-slate-900 border rounded-xl p-3 shadow-lg flex flex-col justify-between transition-all w-64 ${
      match.isPlayed ? 'border-slate-800' : isReadyToPlay ? 'border-emerald-500/50 ring-1 ring-emerald-500/30' : 'border-slate-800/50 opacity-60'
    }`}>
      {/* Header: Stage & Penalty Tag */}
      <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
        <span className="uppercase font-bold tracking-wider text-slate-300">Match #{match.matchNumber}</span>
        {match.wentToPenalties && (
          <span className="text-amber-400 bg-amber-950/80 border border-amber-800/50 px-1.5 py-0.5 rounded">
            PENS ({match.homePenaltyScore}-{match.awayPenaltyScore})
          </span>
        )}
        {match.wentToExtraTime && !match.wentToPenalties && (
          <span className="text-sky-400 bg-sky-950/80 border border-sky-800/50 px-1.5 py-0.5 rounded">
            AET
          </span>
        )}
      </div>

      {/* Teams Container */}
      <div className="space-y-1.5 my-1">
        {/* Home Team */}
        <div className={`flex items-center justify-between p-1.5 rounded border ${
          match.winner?.id === match.homeTeam?.id && match.homeTeam ? 'bg-emerald-950/40 border-emerald-500/40 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center space-x-2 min-w-0">
            {match.homeTeam ? (
              <>
                <img src={match.homeTeam.flag_url} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                <span className="text-xs font-bold truncate">{match.homeTeam.name}</span>
              </>
            ) : (
              <span className="text-xs italic text-slate-600 font-mono">TBD</span>
            )}
          </div>
          <span className="text-xs font-mono font-black px-1.5">{renderScore(true)}</span>
        </div>

        {/* Away Team */}
        <div className={`flex items-center justify-between p-1.5 rounded border ${
          match.winner?.id === match.awayTeam?.id && match.awayTeam ? 'bg-emerald-950/40 border-emerald-500/40 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center space-x-2 min-w-0">
            {match.awayTeam ? (
              <>
                <img src={match.awayTeam.flag_url} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                <span className="text-xs font-bold truncate">{match.awayTeam.name}</span>
              </>
            ) : (
              <span className="text-xs italic text-slate-600 font-mono">TBD</span>
            )}
          </div>
          <span className="text-xs font-mono font-black px-1.5">{renderScore(false)}</span>
        </div>
      </div>

      {/* Simulation Action Button */}
      {isReadyToPlay && (
        <button
          onClick={() => onSimulateMatch(match.id)}
          className="mt-2 w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase rounded transition-transform active:scale-95 shadow"
        >
          Simulate Match
        </button>
      )}
    </div>
  );
}