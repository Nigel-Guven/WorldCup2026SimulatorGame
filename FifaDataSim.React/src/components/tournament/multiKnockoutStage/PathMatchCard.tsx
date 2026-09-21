import type { KnockoutMatchup } from "../../../types/knockoutMatchup";
import { PenaltyBadges } from "./PenaltyBadges";

interface PathMatchCardProps {
  match: KnockoutMatchup;
  legs: number;
  onPlay: () => void;
  isThirdPlace?: boolean;
}

// Helper to count converted penalties ('G' or 'GOAL' entries)
function getPenaltyScore(penalties: string[] | null | undefined): number {
  if (!penalties) return 0;
  return penalties.filter((p) => p === "G" || p === "GOAL").length;
}

export function PathMatchCard({ match, legs, onPlay, isThirdPlace }: PathMatchCardProps) {
  const isPlayable = !match.isPlayed && match.teamA !== null && match.teamB !== null;

  const isTeamAWinner = match.isPlayed && match.winner?.id === match.teamA?.id;
  const isTeamBWinner = match.isPlayed && match.winner?.id === match.teamB?.id;

  const aggA = (match.leg1ScoreA ?? 0) + (match.leg2ScoreA ?? 0);
  const aggB = (match.leg1ScoreB ?? 0) + (match.leg2ScoreB ?? 0);

  const hasPenalties =
    match.isPlayed &&
    match.penaltiesA !== null &&
    match.penaltiesA !== undefined &&
    match.penaltiesB !== null &&
    match.penaltiesB !== undefined;

  const penScoreA = getPenaltyScore(match.penaltiesA);
  const penScoreB = getPenaltyScore(match.penaltiesB);

  // Grid layout class: Added a 28px numeric column + 105px badge column when penalties exist
  const gridLayout = legs === 2
    ? hasPenalties
      ? 'grid-cols-[1fr_28px_28px_36px_28px_105px]'
      : 'grid-cols-[1fr_28px_28px_36px]'
    : hasPenalties
      ? 'grid-cols-[1fr_32px_28px_105px]'
      : 'grid-cols-[1fr_32px]';

  return (
    <div className="border border-gray-300 rounded-xl p-5 bg-white shadow-xs hover:border-gray-300 transition-all w-full max-w-sm">
      
      {/* Column Headers for 2-Leg Matches */}
      {legs === 2 && (
        <div
          className={`grid ${gridLayout} items-center gap-2 pb-1.5 px-1.5 text-[9px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100`}
        >
          <span>Team</span>
          <span className="text-center">L1</span>
          <span className="text-center">L2</span>
          <span className="text-center">AGG</span>
          {hasPenalties && (
            <>
              <span className="text-center">PEN</span>
              <span className="text-left pl-1">KICKS</span>
            </>
          )}
        </div>
      )}

      <div className="space-y-1 mt-1.5">
        
        {/* TEAM A */}
        <div
          className={`grid ${gridLayout} items-center gap-2 p-1.5 rounded-lg text-xs transition-colors ${
            isTeamAWinner
              ? 'bg-blue-50/70 font-bold text-blue-950'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {/* Team Name & Flag */}
          <div className="flex items-center gap-1.5 min-w-0 pr-1">
            {match.teamA?.flag_url ? (
              <img
                src={match.teamA.flag_url}
                alt={`${match.teamA.name} flag`}
                className="w-4 h-3 object-cover rounded-2xs shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-4 h-3 bg-gray-200 rounded-2xs shrink-0" />
            )}
            <span className="truncate">
              {match.teamA ? match.teamA.name : 'TBD'}
              {match.teamA?.isStarred == true && (
                <span className="ml-1 text-sm" title="Starred Country">⭐</span>
              )}  
            </span>
          </div>

          {/* Regular Scores */}
          {legs === 2 ? (
            <>
              <span className="text-center text-[11px] text-gray-500 font-mono">
                {match.leg1ScoreA ?? '-'}
              </span>
              <span className="text-center text-[11px] text-gray-500 font-mono">
                {match.leg2ScoreA ?? '-'}
              </span>
              <span
                className={`text-center text-[11px] font-mono font-bold py-0.5 rounded ${
                  isTeamAWinner
                    ? 'bg-blue-100 text-blue-950'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {match.isPlayed ? aggA : '-'}
              </span>
            </>
          ) : (
            <span className="text-right text-[12px] font-mono font-bold">
              {match.leg1ScoreA ?? '-'}
            </span>
          )}

          {/* Penalty Score & Badges */}
          {hasPenalties && (
            <>
              <span className="text-center text-[11px] font-mono font-bold text-amber-700 bg-amber-50 rounded py-0.5 border border-amber-200/60">
                {penScoreA}
              </span>
              <div className="flex items-center justify-start overflow-visible pl-1">
                <PenaltyBadges penalties={match.penaltiesA} />
              </div>
            </>
          )}
        </div>

        {/* TEAM B */}
        <div
          className={`grid ${gridLayout} items-center gap-2 p-1.5 rounded-lg text-xs transition-colors ${
            isTeamBWinner
              ? 'bg-blue-50/70 font-bold text-blue-950'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {/* Team Name & Flag */}
          <div className="flex items-center gap-1.5 min-w-0 pr-1">
            {match.teamB?.flag_url ? (
              <img
                src={match.teamB.flag_url}
                alt={`${match.teamB.name} flag`}
                className="w-4 h-3 object-cover rounded-2xs shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-4 h-3 bg-gray-200 rounded-2xs shrink-0" />
            )}
            <span className="truncate">
              {match.teamB ? match.teamB.name : 'TBD'}
              {match.teamB?.isStarred == true && (
                <span className="ml-1 text-sm" title="Starred Country">⭐</span>
              )}
              </span>
          </div>

          {/* Regular Scores */}
          {legs === 2 ? (
            <>
              <span className="text-center text-[11px] text-gray-500 font-mono">
                {match.leg1ScoreB ?? '-'}
              </span>
              <span className="text-center text-[11px] text-gray-500 font-mono">
                {match.leg2ScoreB ?? '-'}
              </span>
              <span
                className={`text-center text-[11px] font-mono font-bold py-0.5 rounded ${
                  isTeamBWinner
                    ? 'bg-blue-100 text-blue-950'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {match.isPlayed ? aggB : '-'}
              </span>
            </>
          ) : (
            <span className="text-right text-[12px] font-mono font-bold">
              {match.leg1ScoreB ?? '-'}
            </span>
          )}

          {/* Penalty Score & Badges */}
          {hasPenalties && (
            <>
              <span className="text-center text-[11px] font-mono font-bold text-amber-700 bg-amber-50 rounded py-0.5 border border-amber-200/60">
                {penScoreB}
              </span>
              <div className="flex items-center justify-start overflow-visible pl-1">
                <PenaltyBadges penalties={match.penaltiesB} />
              </div>
            </>
          )}
        </div>

      </div>

      {/* Action Button */}
      {isPlayable && (
        <button
          type="button"
          onClick={onPlay}
          className="mt-3 w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] rounded-md transition-all active:scale-[0.99]"
        >
          Play Match
        </button>
      )}
    </div>
  );
}