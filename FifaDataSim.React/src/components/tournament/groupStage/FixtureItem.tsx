import type { ChangeEvent, JSX } from "react";
import type { Fixture } from "../../../services/helpers/groupSimulationUtils";

export function FixtureItem({
  fixture,
  onScoreChange,
}: {
  fixture: Fixture;
  onScoreChange: (fixtureId: string, side: 'home' | 'away', value: string) => void;
}): JSX.Element {
  const isBye = !fixture.homeTeam || !fixture.awayTeam;

  if (isBye) {
    const activeTeam = fixture.homeTeam || fixture.awayTeam;
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-[11px] text-gray-500 flex justify-between items-center">
        <span>
          Group <strong>{fixture.groupKey}</strong> (R{fixture.round})
        </span>
        <span className="font-medium text-gray-600 flex items-center gap-1.5 truncate">
          {activeTeam?.flag_url && (
            <img
              src={activeTeam.flag_url}
              alt={`${activeTeam.name} flag`}
              className="w-4 h-3 object-cover rounded-xs shrink-0 shadow-2xs"
            />
          )}
          <span className="truncate" title={activeTeam?.name}>{activeTeam?.name}</span> HAS A BYE
        </span>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-xl p-2 bg-white shadow-2xs flex items-center justify-between transition-all ${
        fixture.isPlayed ? 'border-gray-200 bg-gray-50/30' : 'border-blue-200 bg-blue-50/10'
      }`}
    >
      {/* Home Team (Right Aligned Name + Flag) */}
      <div className="flex-1 flex items-center justify-end gap-1.5 text-right font-medium text-xs text-gray-800 pr-1 min-w-0 overflow-hidden">
        <span className="truncate" title={fixture.homeTeam?.name}>
          {fixture.homeTeam?.isStarred == true && (
            <span className="mr-0.5 text-xs" title="Starred Country">⭐</span>
          )}
          {fixture.homeTeam?.name}
        </span>
        {fixture.homeTeam?.flag_url && (
          <img
            src={fixture.homeTeam.flag_url}
            alt={`${fixture.homeTeam.name} flag`}
            className="w-4 h-3 object-cover rounded-xs shrink-0 shadow-2xs"
          />
        )}
      </div>

      {/* Editable Score Inputs */}
      <div className="flex items-center gap-1 px-1 shrink-0">
        <input
          type="number"
          min={0}
          value={fixture.homeScore ?? ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onScoreChange(fixture.id, 'home', e.target.value)}
          className="w-7 h-7 text-center border border-gray-300 rounded-md text-xs font-bold focus:border-blue-500 focus:outline-none bg-white"
        />
        <span className="text-gray-300 font-bold text-xs">-</span>
        <input
          type="number"
          min={0}
          value={fixture.awayScore ?? ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onScoreChange(fixture.id, 'away', e.target.value)}
          className="w-7 h-7 text-center border border-gray-300 rounded-md text-xs font-bold focus:border-blue-500 focus:outline-none bg-white"
        />
      </div>

      {/* Away Team (Left Aligned Flag + Name) */}
      <div className="flex-1 flex items-center justify-start gap-1.5 text-left font-medium text-xs text-gray-800 pl-1 min-w-0 overflow-hidden">
        {fixture.awayTeam?.flag_url && (
          <img
            src={fixture.awayTeam.flag_url}
            alt={`${fixture.awayTeam.name} flag`}
            className="w-4 h-3 object-cover rounded-xs shrink-0 shadow-2xs"
          />
        )}
        <span className="truncate" title={fixture.awayTeam?.name}>
          {fixture.awayTeam?.name}
          {fixture.awayTeam?.isStarred == true && (
            <span className="ml-0.5 text-xs" title="Starred Country">⭐</span>
          )}
        </span>
      </div>
    </div>
  );
}