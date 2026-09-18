import type { Country } from "../../../types/country";

export function TeamSlotRow({
  team,
  isWinner,
  leg1Score,
  leg2Score,
  penalties,
  legs,
}: {
  team: Country | null;
  isWinner: boolean;
  leg1Score?: number | null;
  leg2Score?: number | null;
  penalties?: number | null;
  legs: number;
}) {
  return (
    <div className={`flex justify-between items-center text-xs ${isWinner ? 'font-bold text-blue-950' : 'text-gray-600'}`}>
      <div className="flex items-center gap-1.5 truncate max-w-[110px]">
        {team?.flag_url && (
          <img
            src={team.flag_url}
            alt={`${team.name} flag`}
            className="w-4 h-3 object-cover rounded-sm shrink-0 shadow-xs"
          />
        )}
        <span className="truncate">{team ? team.name : 'TBD'}</span>
      </div>

      <div className="flex items-center gap-1 text-[11px]">
        {leg1Score !== undefined && leg1Score !== null && (
          <span className="w-4 text-center">{leg1Score}</span>
        )}
        {legs === 2 && leg2Score !== undefined && leg2Score !== null && (
          <span className="w-4 text-center text-gray-400">({leg2Score})</span>
        )}
        {penalties !== undefined && penalties !== null && (
          <span className="text-[10px] text-amber-600 font-bold ml-1">p{penalties}</span>
        )}
      </div>
    </div>
  );
}