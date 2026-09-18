import type { KnockoutMatchup } from "../../../types/knockoutMatchup";
import { TeamSlotRow } from "./TeamSlotRow";

export function KnockoutMatchCard({
  match,
  legs,
  onPlay,
  isThirdPlace = false,
}: {
  match: KnockoutMatchup;
  legs: number;
  onPlay: () => void;
  isThirdPlace?: boolean;
}) {
  const isPlayable = !match.isPlayed && match.teamA !== null && match.teamB !== null;

  return (
    <div
      className={`border rounded-xl p-3 bg-white shadow-sm transition-all ${
        isThirdPlace ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'
      }`}
    >
      <div className="space-y-2">
        {/* Team A Slot */}
        <TeamSlotRow
          team={match.teamA}
          isWinner={match.winner?.id === match.teamA?.id && match.isPlayed}
          leg1Score={match.leg1ScoreA}
          leg2Score={match.leg2ScoreA}
          penalties={match.penaltiesA}
          legs={legs}
        />

        <div className="border-t border-gray-100 my-1" />

        {/* Team B Slot */}
        <TeamSlotRow
          team={match.teamB}
          isWinner={match.winner?.id === match.teamB?.id && match.isPlayed}
          leg1Score={match.leg1ScoreB}
          leg2Score={match.leg2ScoreB}
          penalties={match.penaltiesB}
          legs={legs}
        />
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