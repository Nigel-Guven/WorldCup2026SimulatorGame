import { useCallback, type JSX } from 'react';
import { DrawHeader } from './DrawHeader';
import { PotSidebar } from './PotSidebar';
import { DrawUtils } from '../../../../services/helpers/drawUtils';
import { useDrawAssignment } from '../../../../hooks/useDrawAssignment';
import type { Country } from '../../../../types/country';
import type { MultiKnockoutPhase } from '../../../../types/tournamentConfiguration';
import type { Pot } from '../../../../types/pot';

interface MultiKnockoutDrawViewProps {
  phase: MultiKnockoutPhase;
  pots: Pot[];
  onComplete: (paths: Record<string, Country[]>) => void;
}

export function MultiKnockoutDrawView({
  phase,
  pots,
  onComplete,
}: MultiKnockoutDrawViewProps): JSX.Element {
  const totalTeams = phase.teams.length;
  const pathCount = phase.config.number_of_paths || 2;
  const teamsPerPath = Math.ceil(totalTeams / pathCount);

  // Helper to generate empty path map: { "A": [], "B": [], ... }
  const createEmptyPaths = useCallback(() => {
    const initial: Record<string, Country[]> = {};
    for (let i = 0; i < pathCount; i++) {
      initial[DrawUtils.getGroupKey(i)] = [];
    }
    return initial;
  }, [pathCount]);

  const {
    drawState: paths,
    setDrawState: setPaths,
    selectedTeam,
    assignedTeamIds,
    isComplete,
    selectTeam,
    handleDrawNextAvailable,
    handleAutoDrawAll,
    handleReset,
    getResult,
  } = useDrawAssignment<Country, Record<string, Country[]>, Record<string, Country[]>>({
    totalTeams,
    initialState: createEmptyPaths(),
    getAssignedIds: (pathState: Record<string, Country[]>) => {
      const ids = new Set<string | number>();
      Object.values(pathState).forEach((teamList) => {
        teamList.forEach((t) => t.id !== undefined && ids.add(t.id));
      });
      return ids;
    },

    // Assigns a single team to the next path with open slots
    assignSingleTeam: (pathState: Record<string, Country[]>, team: Country) => {
      const nextPathKey = Object.keys(pathState).find(
        (key) => (pathState[key]?.length || 0) < teamsPerPath
      );
      if (!nextPathKey) return pathState;

      return {
        ...pathState,
        [nextPathKey]: [...(pathState[nextPathKey] || []), team],
      };
    },

    autoDrawAll: () => DrawUtils.roundRobinDistribute(phase.teams, pathCount),
    buildResult: (pathState: Record<string, Country[]>) => pathState,
  });

  const handleAssignToPath = (pathKey: string) => {
    if (!selectedTeam) return;
    const currentPath = paths[pathKey] || [];
    if (currentPath.length >= teamsPerPath) return;

    setPaths((prev) => ({
      ...prev,
      [pathKey]: [...(prev[pathKey] || []), selectedTeam],
    }));
    selectTeam(selectedTeam); // Deselect after placing
  };

  const handleRemoveFromPath = (pathKey: string, teamId: string | number | undefined) => {
    if (teamId === undefined) return;
    setPaths((prev) => ({
      ...prev,
      [pathKey]: (prev[pathKey] || []).filter((t) => t.id !== teamId),
    }));
  };

  const pathKeys = Object.keys(paths);

  return (
    <div className="space-y-6">
      <DrawHeader
        title="Multi-Branch Path Draw"
        subtitle={`Distribute teams across ${pathCount} independent knockout qualification paths.`}
        assignedCount={assignedTeamIds.size}
        totalTeams={totalTeams}
        isComplete={isComplete}
        confirmLabel="Confirm Multi-Branch Paths"
        onDrawNext={() => handleDrawNextAvailable(pots)}
        onAutoDraw={handleAutoDrawAll}
        onNationsLeagueDraw={handleAutoDrawAll}
        onReset={handleReset}
        onConfirm={() => onComplete(getResult())}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <PotSidebar
            pots={pots}
            assignedTeamIds={assignedTeamIds}
            selectedTeam={selectedTeam}
            onSelectTeam={selectTeam}
          />
        </div>

        <div className="lg:col-span-8">
          <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider mb-4">
            Qualification Paths
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathKeys.map((pathKey) => {
              const currentTeams = paths[pathKey] || [];
              const isFull = currentTeams.length >= teamsPerPath;

              return (
                <div
                  key={pathKey}
                  onClick={() => selectedTeam && !isFull && handleAssignToPath(pathKey)}
                  className={`bg-white border-2 rounded-xl p-4 shadow-sm transition-all ${
                    selectedTeam && !isFull
                      ? 'border-dashed border-amber-400 bg-amber-50/20 cursor-pointer hover:border-amber-500'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                    <h5 className="font-bold text-gray-800 text-sm">Path {pathKey}</h5>
                    <span className="text-xs text-gray-400">
                      {currentTeams.length} / {teamsPerPath}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {Array.from({ length: teamsPerPath }).map((_, slotIdx) => {
                      const team = currentTeams[slotIdx];

                      return team ? (
                        <div
                          key={team.id ?? slotIdx}
                          className="flex justify-between items-center bg-blue-50/60 border border-blue-200 text-blue-900 text-xs px-3 py-2 rounded-lg font-medium"
                        >
                          <span>
                            <strong className="text-blue-500 mr-2">{slotIdx + 1}.</strong>
                            {team.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromPath(pathKey, team.id);
                            }}
                            className="text-blue-400 hover:text-red-500 text-xs font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div
                          key={`empty-${slotIdx}`}
                          className={`text-xs px-3 py-2 rounded-lg border border-dashed flex items-center ${
                            selectedTeam
                              ? 'border-amber-300 bg-amber-50/50 text-amber-700'
                              : 'border-gray-200 text-gray-300'
                          }`}
                        >
                          <span className="mr-2 text-gray-300">{slotIdx + 1}.</span>
                          {selectedTeam ? 'Click to assign to Path' : 'Empty Path Slot'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}