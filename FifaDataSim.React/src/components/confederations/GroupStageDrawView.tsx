import { useCallback, type JSX } from 'react';
import { DrawHeader } from './DrawHeader';
import { PotSidebar } from './PotSidebar';
import { DrawUtils } from '../../services/helpers/drawUtils';
import type { Country } from '../../types/country';
import type { GroupStagePhase } from '../../types/tournamentConfig';
import type { Pot } from './TournamentExecutionView';
import { useDrawAssignment } from '../../hooks/useDrawAssignment';

interface GroupStageDrawViewProps {
  phase: GroupStagePhase;
  pots: Pot[];
  onComplete: (groups: Record<string, Country[]>) => void;
}

export function GroupStageDrawView({
  phase,
  pots,
  onComplete,
}: GroupStageDrawViewProps): JSX.Element {
  const numberofGroups = phase.config.number_of_groups || 1;
  const groupSize = phase.config.group_size || 4;
  const totalSlots = Math.min(phase.teams.length, numberofGroups * groupSize);

  // Helper to generate empty groups map: { "A": [], "B": [], ... }
  const createEmptyGroups = useCallback(() => {
    const initial: Record<string, Country[]> = {};
    for (let i = 0; i < numberofGroups; i++) {
      initial[DrawUtils.getGroupKey(i)] = [];
    }
    return initial;
  }, [numberofGroups]);

  // FIFO auto-draw logic: distributes pot-by-pot across available groups
  const autoDrawGroups = useCallback(() => {
    const newGroups: Record<string, Country[]> = {};
    for (let i = 0; i < numberofGroups; i++) {
      newGroups[DrawUtils.getGroupKey(i)] = [];
    }

    // Shuffle each pot independently before drawing
    const randomizedPotsTeams = pots.flatMap((pot) => DrawUtils.shuffle(pot.teams));

    let teamIdx = 0;
    while (teamIdx < randomizedPotsTeams.length) {
      const groupKey = DrawUtils.getGroupKey(teamIdx % numberofGroups);
      const team = randomizedPotsTeams[teamIdx];

      if (team && newGroups[groupKey] && newGroups[groupKey].length < groupSize) {
        newGroups[groupKey].push(team);
      }
      teamIdx++;
    }

    return newGroups;
  }, [pots, numberofGroups, groupSize]);

  const {
    drawState: groups,
    setDrawState: setGroups,
    selectedTeam,
    assignedTeamIds,
    isComplete,
    selectTeam,
    handleDrawNextAvailable,
    handleAutoDrawAll,
    handleReset,
    getResult,
  } = useDrawAssignment<Country, Record<string, Country[]>, Record<string, Country[]>>({
    totalTeams: totalSlots,
    initialState: createEmptyGroups(),
    getAssignedIds: (groupState) => {
      const ids = new Set<string | number>();
      Object.values(groupState).forEach((teamList) => {
        teamList.forEach((t) => t.id !== undefined && ids.add(t.id));
      });
      return ids;
    },
    assignSingleTeam: (groupState: Record<string, Country[]>, team: Country) => {

      const totalAssigned = Object.values(groupState).reduce(
        (sum, list) => sum + list.length,
        0
      );

      // 3. Round-robin placement: Total 0 -> Group A, 1 -> Group B, 2 -> Group C, 3 -> Group A...
      const groupIndex = totalAssigned % numberofGroups;
      const targetGroupKey = DrawUtils.getGroupKey(groupIndex);

      // Fallback: If target group is somehow full, pick next open group
      const nextGroupKey =
        (groupState[targetGroupKey]?.length || 0) < groupSize
          ? targetGroupKey
          : Object.keys(groupState).find(
              (key) => (groupState[key]?.length || 0) < groupSize
            );

      if (!nextGroupKey) return groupState;

      return {
        ...groupState,
        [nextGroupKey]: [...(groupState[nextGroupKey] || []), team],
      };
    },
    autoDrawAll: autoDrawGroups,
    buildResult: (groupState) => groupState,
  });

  const handleAssignToGroup = (groupKey: string) => {
    if (!selectedTeam) return;
    const currentGroup = groups[groupKey] || [];
    if (currentGroup.length >= groupSize) return;

    setGroups((prev) => ({
      ...prev,
      [groupKey]: [...(prev[groupKey] || []), selectedTeam],
    }));
    selectTeam(selectedTeam); // Deselect after placement
  };

  const handleRemoveFromGroup = (groupKey: string, teamId: string | number | undefined) => {
    if (teamId === undefined) return;
    setGroups((prev) => ({
      ...prev,
      [groupKey]: (prev[groupKey] || []).filter((t) => t.id !== teamId),
    }));
  };

  const groupKeys = Object.keys(groups);

  return (
    <div className="space-y-6">
      <DrawHeader
        title="Group Stage Draw"
        subtitle="Draw teams one-by-one or assign manually."
        assignedCount={assignedTeamIds.size}
        totalTeams={totalSlots}
        isComplete={isComplete}
        confirmLabel="Lock & Confirm Groups"
        onDrawNext={() => handleDrawNextAvailable(pots)}
        onAutoDraw={handleAutoDrawAll}
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
            Group Allocations
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupKeys.map((groupKey) => {
              const currentTeams = groups[groupKey] || [];
              const isFull = currentTeams.length >= groupSize;

              return (
                <div
                  key={groupKey}
                  onClick={() => selectedTeam && !isFull && handleAssignToGroup(groupKey)}
                  className={`bg-white border-2 rounded-xl p-4 shadow-sm transition-all ${
                    selectedTeam && !isFull
                      ? 'border-dashed border-amber-400 bg-amber-50/20 cursor-pointer hover:border-amber-500'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                    <h5 className="font-bold text-gray-800 text-sm">
                      Group {groupKey}
                    </h5>
                    <span className="text-xs text-gray-400">
                      {currentTeams.length} / {groupSize}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {Array.from({ length: groupSize }).map((_, slotIdx) => {
                      const team = currentTeams[slotIdx];

                      return team ? (
                        <div
                          key={team.id ?? slotIdx}
                          className="flex justify-between items-center bg-blue-50/60 border border-blue-200 text-blue-900 text-xs px-3 py-2 rounded-lg font-medium"
                        >
                          <span>
                            <strong className="text-blue-500 mr-2">
                              {slotIdx + 1}.
                            </strong>
                            {team.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromGroup(groupKey, team.id);
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
                          {selectedTeam ? 'Click to assign selected team' : 'Empty Slot'}
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