import type { JSX } from 'react';
import type { Country } from '../../types/country';
import type { Pot } from './TournamentExecutionView';

interface PotSidebarProps {
  pots: Pot[];
  assignedTeamIds: Set<string | number>;
  selectedTeam: Country | null;
  onSelectTeam: (team: Country) => void;
}

export function PotSidebar({
  pots,
  assignedTeamIds,
  selectedTeam,
  onSelectTeam,
}: PotSidebarProps): JSX.Element {
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">
        Seed Pools
      </h4>
      {pots.map((pot) => {
        const unassigned = pot.teams.filter(
          (t: Country) => t.id !== undefined && !assignedTeamIds.has(t.id)
        );

        return (
          <div key={pot.id} className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-xs text-gray-700">{pot.name}</span>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {unassigned.length} Left
              </span>
            </div>
            <div className="space-y-1.5">
              {pot.teams.map((team) => {
                const isAssigned = team.id !== undefined && assignedTeamIds.has(team.id);
                const isSelected = selectedTeam?.id === team.id;

                return (
                  <button
                    key={team.id}
                    type="button"
                    disabled={isAssigned}
                    onClick={() => onSelectTeam(team)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex justify-between items-center transition-all ${
                      isAssigned
                        ? 'bg-gray-100 text-gray-400 line-through cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-amber-100 text-amber-900 border-2 border-amber-400 font-bold shadow-sm'
                        : 'bg-gray-50 hover:bg-blue-50 text-gray-700 border border-gray-200 cursor-pointer'
                    }`}
                  >
                    <span>{team.name}</span>
                    {isSelected && <span className="text-[10px]">SELECTED</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}