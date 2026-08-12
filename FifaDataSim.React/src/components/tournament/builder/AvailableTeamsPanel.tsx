import { useState, type JSX } from 'react';
import type { Confederation } from '../../../types/confederation';
import type { Country } from '../../../types/country';
import { CONFEDERATIONS } from '../../../types/confederationConfiguration';
import { ConfederationBox } from './ConfederationBox';

interface AvailableTeamsPanelProps {
  teamsData: Record<Confederation, Country[]>;
  loadingStates: Record<Confederation, boolean>;
  errorStates: Record<Confederation, string | null>;
  assignedTeamIds: Set<string | number>;
  onReload: (confederation: Confederation) => Promise<void>;
  onAssignMultipleTeams?: (teams: Country[]) => void;
}

export function AvailableTeamsPanel({
  teamsData,
  loadingStates,
  errorStates,
  assignedTeamIds,
  onReload,
  onAssignMultipleTeams,
}: AvailableTeamsPanelProps): JSX.Element {
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string | number>>(new Set());

  // Toggle single team selection
  const handleToggleSelectTeam = (teamId: string | number) => {
    setSelectedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  // Select or Deselect all available teams in a confederation
  const handleToggleSelectConfederation = (teams: Country[]) => {
    const unassignedTeamIds = teams
      .map((t) => t.id)
      .filter((id): id is string => id !== undefined && !assignedTeamIds.has(id));

    const allSelected = unassignedTeamIds.every((id) => selectedTeamIds.has(id));

    setSelectedTeamIds((prev) => {
      const next = new Set(prev);
      unassignedTeamIds.forEach((id) => {
        if (allSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedTeamIds(new Set());
  };

  // Collect selected Country objects for batch assignment
  const handleBatchAssign = () => {
    if (!onAssignMultipleTeams) return;

    const allAvailableTeams = Object.values(teamsData).flat();
    const selectedTeams = allAvailableTeams.filter(
      (t) => t.id !== undefined && selectedTeamIds.has(t.id)
    );

    onAssignMultipleTeams(selectedTeams);
    setSelectedTeamIds(new Set());
  };

  return (
    <div className="w-full lg:w-1/2 xl:w-7/12 space-y-4">
      {/* Panel Header & Batch Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-800">
          Available Teams
        </h2>

        {selectedTeamIds.size > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="font-semibold text-blue-900">
              {selectedTeamIds.size} Selected
            </span>
            <button
              type="button"
              onClick={handleBatchAssign}
              className="px-2 py-1 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors"
            >
              Add Selected
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-gray-500 hover:text-gray-700 font-medium px-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONFEDERATIONS.map((conf) => {
          const allConfTeams = teamsData[conf.id] || [];

          const availableTeams = allConfTeams.filter(
            (team) => team.id !== undefined && !assignedTeamIds.has(team.id)
          );

          return (
            <ConfederationBox
              key={conf.id}
              conf={conf}
              teams={availableTeams}
              isLoading={loadingStates[conf.id]}
              error={errorStates[conf.id]}
              selectedTeamIds={selectedTeamIds}
              onToggleSelectTeam={handleToggleSelectTeam}
              onToggleSelectConfederation={() => handleToggleSelectConfederation(availableTeams)}
              onReload={onReload}
            />
          );
        })}
      </div>
    </div>
  );
}