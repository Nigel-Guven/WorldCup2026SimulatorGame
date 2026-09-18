import type { KnockoutMatchup } from "../../../types/knockoutMatchup";

export function PathMatchCard({
  match,
  legs,
  onPlay,
}: {
  match: KnockoutMatchup;
  legs: number;
  onPlay: () => void;
}) {
  const isPlayable = !match.isPlayed && match.teamA !== null && match.teamB !== null;

  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm transition-all">
      <div className="space-y-2">
        {/* Team A Slot */}
        <div
          className={`flex justify-between items-center text-xs ${
            match.winner?.id === match.teamA?.id && match.isPlayed
              ? 'font-bold text-blue-950'
              : 'text-gray-600'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate max-w-[110px]">
            {match.teamA?.flag_url && (
              <img
                src={match.teamA.flag_url}
                alt={`${match.teamA.name} flag`}
                className="w-4 h-3 object-cover rounded-sm shrink-0 shadow-xs"
              />
            )}
            <span className="truncate">{match.teamA ? match.teamA.name : 'TBD'}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {match.leg1ScoreA !== null && <span>{match.leg1ScoreA}</span>}
            {legs === 2 && match.leg2ScoreA !== null && (
              <span className="text-gray-400">({match.leg2ScoreA})</span>
            )}
            {match.penaltiesA !== null && (
              <span className="text-[10px] text-amber-600 font-bold">p{match.penaltiesA}</span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 my-1" />

        {/* Team B Slot */}
        <div
          className={`flex justify-between items-center text-xs ${
            match.winner?.id === match.teamB?.id && match.isPlayed
              ? 'font-bold text-blue-950'
              : 'text-gray-600'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate max-w-[110px]">
            {match.teamB?.flag_url && (
              <img
                src={match.teamB.flag_url}
                alt={`${match.teamB.name} flag`}
                className="w-4 h-3 object-cover rounded-sm shrink-0 shadow-xs"
              />
            )}
            <span className="truncate">{match.teamB ? match.teamB.name : 'TBD'}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {match.leg1ScoreB !== null && <span>{match.leg1ScoreB}</span>}
            {legs === 2 && match.leg2ScoreB !== null && (
              <span className="text-gray-400">({match.leg2ScoreB})</span>
            )}
            {match.penaltiesB !== null && (
              <span className="text-[10px] text-amber-600 font-bold">p{match.penaltiesB}</span>
            )}
          </div>
        </div>
      </div>

      {isPlayable && (
        <button
          type="button"
          onClick={onPlay}
          className="mt-3 w-full py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg transition-all"
        >
          Play Match
        </button>
      )}
    </div>
  );
}