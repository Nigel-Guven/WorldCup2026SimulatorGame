import type { ChangeEvent } from "react";
import type { Fixture } from "../../../services/helpers/groupSimulationUtils";

export function FixtureItem({
  fixture,
  onScoreChange,
}: {
  fixture: Fixture;
  onScoreChange: (fixtureId: string, side: 'home' | 'away', value: string) => void;
}) {
  const isBye = !fixture.homeTeam || !fixture.awayTeam;

  if (isBye) {
    const activeTeam = fixture.homeTeam || fixture.awayTeam;
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-500 flex justify-between items-center">
        <span>
          Group <strong>{fixture.groupKey}</strong> (R{fixture.round})
        </span>
        <span className="font-medium text-gray-600 flex items-center gap-2">
          {activeTeam?.flag_url && (
            <img
              src={activeTeam.flag_url}
              alt={`${activeTeam.name} flag`}
              className="w-4 h-3 object-cover rounded-sm shadow-xs"
            />
          )}
          <strong>{activeTeam?.name}</strong> HAS A BYE
        </span>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-xl p-3 bg-white shadow-sm flex items-center justify-between transition-all ${
        fixture.isPlayed ? 'border-gray-200 bg-gray-50/30' : 'border-blue-200 bg-blue-50/10'
      }`}
    >
      {/* Home Team (Right Aligned Name + Flag) */}
      <div className="flex-1 flex items-center justify-end gap-2 text-right font-medium text-xs text-gray-800 pr-2 truncate">
        <span className="truncate">{fixture.homeTeam?.name}</span>
        {fixture.homeTeam?.flag_url && (
          <img
            src={fixture.homeTeam.flag_url}
            alt={`${fixture.homeTeam.name} flag`}
            className="w-4 h-3 object-cover rounded-sm shrink-0 shadow-xs"
          />
        )}
      </div>

      {/* Editable Score Inputs */}
      <div className="flex items-center gap-1.5 px-2">
        <input
          type="number"
          min={0}
          value={fixture.homeScore ?? ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onScoreChange(fixture.id, 'home', e.target.value)}
          className="w-8 h-8 text-center border border-gray-300 rounded-lg text-xs font-bold focus:border-blue-500 focus:outline-none"
        />
        <span className="text-gray-300 font-bold text-xs">-</span>
        <input
          type="number"
          min={0}
          value={fixture.awayScore ?? ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onScoreChange(fixture.id, 'away', e.target.value)}
          className="w-8 h-8 text-center border border-gray-300 rounded-lg text-xs font-bold focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Away Team (Left Aligned Flag + Name) */}
      <div className="flex-1 flex items-center justify-start gap-2 text-left font-medium text-xs text-gray-800 pl-2 truncate">
        {fixture.awayTeam?.flag_url && (
          <img
            src={fixture.awayTeam.flag_url}
            alt={`${fixture.awayTeam.name} flag`}
            className="w-4 h-3 object-cover rounded-sm shrink-0 shadow-xs"
          />
        )}
        <span className="truncate">{fixture.awayTeam?.name}</span>
      </div>
    </div>
  );
}