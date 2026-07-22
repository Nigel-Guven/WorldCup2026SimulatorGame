import { getDisplayScore } from '../../services/helpers/getDisplayScore';
import type { KnockoutMatch } from '../../types/knockoutMatch';

interface KnockoutMatchCardProps {
  match: KnockoutMatch;
  onSimulateMatch: (matchId: string) => void;
}

export default function KnockoutMatchCard({
  match,
  onSimulateMatch,
}: KnockoutMatchCardProps) {
  const isReadyToPlay = Boolean(match.homeTeam && match.awayTeam && !match.isPlayed);

  // Dynamic card border/bg styling
  const cardBorderClass = match.isPlayed
    ? 'border-slate-800'
    : isReadyToPlay
    ? 'border-emerald-500/50 ring-1 ring-emerald-500/30'
    : 'border-slate-800/50 opacity-60';

  return (
    <div
      className={`bg-slate-900 border rounded-xl p-3 shadow-lg flex flex-col justify-between transition-all w-64 ${cardBorderClass}`}
    >
      {/* Header: Stage & Status Badges */}
      <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
        <span className="uppercase font-bold tracking-wider text-slate-300">
          Match #{match.matchNumber}
        </span>

        {match.wentToPenalties && (
          <span className="text-amber-400 bg-amber-950/80 border border-amber-800/50 px-1.5 py-0.5 rounded font-bold">
            PENS ({match.homePenaltyScore ?? 0}-{match.awayPenaltyScore ?? 0})
          </span>
        )}

        {match.wentToExtraTime && !match.wentToPenalties && (
          <span className="text-sky-400 bg-sky-950/80 border border-sky-800/50 px-1.5 py-0.5 rounded font-bold">
            AET
          </span>
        )}
      </div>

      {/* Teams & Scores Container */}
      <div className="space-y-1.5 my-1">
        {/* Home Team Row */}
        <TeamRow
          team={match.homeTeam}
          score={getDisplayScore(match.isPlayed, true, match)}
          isWinner={Boolean(
            match.winner?.id &&
              match.homeTeam?.id &&
              match.winner.id === match.homeTeam.id
          )}
        />

        {/* Away Team Row */}
        <TeamRow
          team={match.awayTeam}
          score={getDisplayScore(match.isPlayed, false, match)}
          isWinner={Boolean(
            match.winner?.id &&
              match.awayTeam?.id &&
              match.winner.id === match.awayTeam.id
          )}
        />
      </div>

      {/* Action Button */}
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

// Sub-component for rendering individual team row inside the match card
interface TeamRowProps {
  team: KnockoutMatch['homeTeam'];
  score: string;
  isWinner: boolean;
}

function TeamRow({ team, score, isWinner }: TeamRowProps) {
  const rowStyle = isWinner
    ? 'bg-emerald-950/40 border-emerald-500/40 text-white'
    : 'bg-slate-950/60 border-slate-800 text-slate-300';

  return (
    <div className={`flex items-center justify-between p-1.5 rounded border ${rowStyle}`}>
      <div className="flex items-center space-x-2 min-w-0">
        {team ? (
          <>
            <img
              src={team.flag_url}
              alt=""
              className="w-5 h-3.5 object-cover rounded shadow-sm shrink-0"
            />
            <span className="text-xs font-bold truncate">{team.name}</span>
          </>
        ) : (
          <span className="text-xs italic text-slate-600 font-mono">TBD</span>
        )}
      </div>
      <span className="text-xs font-mono font-black px-1.5">{score}</span>
    </div>
  );
}