import type { JSX } from 'react';
import type { Country } from '../../../../types/country';
import type { Pot } from '../../../../types/pot';

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
    <div className="space-y-3">
      <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider px-1">
        Seed Pools
      </h4>
      {pots.map((pot) => {
        // Only keep unassigned teams
        const unassignedTeams = pot.teams.filter((t: Country) => {
          if (!t || t.id === undefined || t.id === null) return true;
          return !assignedTeamIds.has(t.id) && !assignedTeamIds.has(String(t.id));
        });

        return (
          <div key={pot.id} className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-2xs">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className="font-bold text-[13px] text-gray-700">{pot.name}</span>
              <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {unassignedTeams.length} Left
              </span>
            </div>
            
            <div className="space-y-1">
              {unassignedTeams.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic px-1 py-0.5">All teams assigned</p>
              ) : (
                unassignedTeams.map((team) => {
                  const isSelected =
                    selectedTeam?.id !== undefined &&
                    String(selectedTeam.id) === String(team.id);

                  return (
                    <button
                      key={team.id ?? team.name}
                      type="button"
                      onClick={() => onSelectTeam(team)}
                      title={team.name}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-[13px] font-medium flex justify-between items-center transition-all ${
                        isSelected
                          ? 'bg-amber-100 text-amber-900 border border-amber-400 font-semibold shadow-2xs'
                          : 'bg-gray-50/80 hover:bg-blue-50 text-gray-700 border border-gray-200/60 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate mr-1.5">
                        {team.flag_url ? (
                          <img
                            src={team.flag_url}
                            alt=""
                            className="w-6 h-4 object-cover rounded-xs shrink-0 shadow-2xs"
                          />
                        ) : (
                          <span className="text-[10px] shrink-0">🏳️</span>
                        )}
                        <span className="truncate">{team.name}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded shrink-0 font-bold uppercase tracking-tight">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}