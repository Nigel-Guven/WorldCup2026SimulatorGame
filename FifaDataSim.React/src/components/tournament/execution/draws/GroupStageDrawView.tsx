import { useMemo, useCallback, type JSX } from 'react';
import { DrawHeader } from './DrawHeader';
import { PotSidebar } from './PotSidebar';
import type { GroupStagePhase } from '../../../../types/tournamentConfiguration';
import type { Country } from '../../../../types/country';
import { DrawUtils } from '../../../../services/helpers/drawUtils';
import { useDrawAssignment } from '../../../../hooks/useDrawAssignment';
import type { Pot } from '../../../../types/pot';
import { PhaseType } from '../../../../types/phaseType';

interface GroupStageDrawViewProps {
  phase: GroupStagePhase;
  pots: Pot[];
  onComplete: (groups: Record<string, Country[]>) => void;
}

// Extract pure helper outside component to avoid recreation
const getTeamKey = (t: Country): string | number | undefined => {
  return t.id ?? (t as unknown as { code?: string }).code ?? (t as unknown as { iso?: string }).iso;
};

export function GroupStageDrawView({
  phase,
  pots = [],
  onComplete,
}: GroupStageDrawViewProps): JSX.Element {
  const numberofGroups = phase?.config?.number_of_groups || 1;
  const groupSize = phase?.config?.group_size || 4;
  const isFixedSeeding = phase?.has_draw === false;

  const totalPotsTeams = useMemo(
    () => pots.reduce((sum, pot) => sum + (pot.teams?.length || 0), 0),
    [pots]
  );

  const totalSlots = useMemo(() => {
    const available = totalPotsTeams || phase?.teams?.length || 0;
    const capacity = numberofGroups * groupSize;
    return available > 0 ? Math.min(available, capacity) : capacity;
  }, [totalPotsTeams, phase?.teams?.length, numberofGroups, groupSize]);

  // Compute initial state incorporating fixed seeding (Nations League style)
  const initialGroups = useMemo(() => {
    if (phase?.type !== PhaseType.GroupStage) {
      return {};
    }

    if (isFixedSeeding && pots.length > 0) {
      const fixed: Record<string, Country[]> = {};
      for (let i = 0; i < numberofGroups; i++) {
        fixed[DrawUtils.getGroupKey(i)] = [];
      }

      pots.forEach((pot) => {
        (pot.teams || []).forEach((team, teamIndex) => {
          const groupIndex = teamIndex % numberofGroups;
          const groupKey = DrawUtils.getGroupKey(groupIndex);
          if (fixed[groupKey] && fixed[groupKey].length < groupSize) {
            fixed[groupKey].push(team);
          }
        });
      });

      return fixed;
    }

    const initial: Record<string, Country[]> = {};
    for (let i = 0; i < numberofGroups; i++) {
      initial[DrawUtils.getGroupKey(i)] = [];
    }
    return initial;
  }, [phase?.type, isFixedSeeding, pots, numberofGroups, groupSize]);

  const autoDrawGroups = useCallback(() => {
    const randomizedPotsTeams = pots.flatMap((pot) => DrawUtils.shuffle(pot.teams || []));
    return DrawUtils.roundRobinDistribute(randomizedPotsTeams, numberofGroups);
  }, [pots, numberofGroups]);

  const {
    drawState: groups,
    setDrawState: setGroups,
    selectedTeam,
    setSelectedTeam,
    assignedTeamIds,
    isComplete,
    selectTeam,
    handleDrawNextAvailable,
    handleAutoDrawAll,
    handleReset,
    getResult,
  } = useDrawAssignment<Country, Record<string, Country[]>, Record<string, Country[]>>({
    totalTeams: totalSlots,
    initialState: initialGroups,

    getAssignedIds: (groupState) => {
      const ids = new Set<string | number>();
      Object.values(groupState).forEach((teamList) => {
        teamList.forEach((t) => {
          const key = getTeamKey(t);
          if (key !== undefined && key !== null) ids.add(key);
        });
      });
      return ids;
    },

    assignSingleTeam: (groupState: Record<string, Country[]>, team: Country) => {
      const entries = Object.entries(groupState);
      const minSize = Math.min(...entries.map(([, list]) => list.length));

      if (minSize >= groupSize) return groupState;

      const targetEntry = entries.find(([, list]) => list.length === minSize);
      if (!targetEntry) return groupState;

      const [targetGroupKey] = targetEntry;

      return {
        ...groupState,
        [targetGroupKey]: [...groupState[targetGroupKey], team],
      };
    },
    autoDrawAll: autoDrawGroups,
    buildResult: (groupState) => groupState,
  });

  // Sequential slot-by-slot distribution: 1st team -> Group 1 slot 1, 2nd team -> Group 2 slot 1, etc.
  const handleDirectNationsLeagueDraw = useCallback(() => {
    const allTeams = pots.flatMap((pot) => pot.teams || []);
    
    if (allTeams.length === 0) {
      console.warn("⚠️ No teams found to draw!");
      return;
    }

    const distributedGroups: Record<string, Country[]> = {};
    for (let i = 0; i < numberofGroups; i++) {
      distributedGroups[DrawUtils.getGroupKey(i)] = [];
    }

    allTeams.forEach((team, index) => {
      const groupIndex = index % numberofGroups;
      const groupKey = DrawUtils.getGroupKey(groupIndex);
      
      if (distributedGroups[groupKey].length < groupSize) {
        distributedGroups[groupKey].push(team);
      }
    });

    setGroups(distributedGroups);
    setSelectedTeam(null);
  }, [pots, numberofGroups, groupSize, setGroups, setSelectedTeam]);

  const handleAssignToGroup = (groupKey: string) => {
    if (isFixedSeeding || !selectedTeam) return;
    const currentGroup = groups[groupKey] || [];
    if (currentGroup.length >= groupSize) return;

    setGroups((prev) => ({
      ...prev,
      [groupKey]: [...(prev[groupKey] || []), selectedTeam],
    }));

    setSelectedTeam(null);
  };

  const handleRemoveFromGroup = (groupKey: string, team: Country) => {
    if (isFixedSeeding) return;
    const keyToRemove = getTeamKey(team);
    if (keyToRemove === undefined) return;

    setGroups((prev) => ({
      ...prev,
      [groupKey]: (prev[groupKey] || []).filter((t) => getTeamKey(t) !== keyToRemove),
    }));
  };

  const groupKeys = Object.keys(groups);

  return (
    <div className="space-y-6">
      <DrawHeader
        title={isFixedSeeding ? 'Fixed Group Seeding' : 'Group Stage Draw'}
        subtitle={
          isFixedSeeding
            ? 'Teams have been automatically placed into groups based on pot seeding.'
            : 'Draw teams one-by-one, auto-draw, or use Nations League tier assignment.'
        }
        assignedCount={assignedTeamIds.size}
        totalTeams={totalSlots}
        isComplete={isComplete}
        confirmLabel="Lock & Confirm Groups"
        onDrawNext={isFixedSeeding ? undefined : () => handleDrawNextAvailable(pots)}
        onAutoDraw={handleAutoDrawAll}
        onNationsLeagueDraw={handleDirectNationsLeagueDraw}
        onReset={handleReset}
        onConfirm={() => onComplete(getResult())}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <PotSidebar
            pots={pots}
            assignedTeamIds={assignedTeamIds}
            selectedTeam={selectedTeam}
            onSelectTeam={isFixedSeeding ? () => {} : selectTeam}
          />
        </div>

        <div className="lg:col-span-8">
          <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider mb-4">
            Group Allocations
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {groupKeys.map((groupKey) => {
              const currentTeams = groups[groupKey] || [];
              const isFull = currentTeams.length >= groupSize;

              return (
                <div
                  key={groupKey}
                  onClick={() =>
                    !isFixedSeeding && selectedTeam && !isFull && handleAssignToGroup(groupKey)
                  }
                  className={`bg-white border-2 rounded-xl p-4 shadow-sm transition-all ${
                    !isFixedSeeding && selectedTeam && !isFull
                      ? 'border-dashed border-amber-400 bg-amber-50/20 cursor-pointer hover:border-amber-500'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                    <h5 className="font-bold text-gray-800 text-sm">Group {groupKey}</h5>
                    <span className="text-xs text-gray-400">
                      {currentTeams.length} / {groupSize}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {Array.from({ length: groupSize }).map((_, slotIdx) => {
                      const team = currentTeams[slotIdx];

                      return team ? (
                        <div
                          key={getTeamKey(team) ?? slotIdx}
                          className="flex justify-between items-center bg-blue-50/60 border border-blue-200 text-blue-900 text-xs px-3 py-2 rounded-lg font-medium"
                        >
                          <span>
                            <strong className="text-blue-500 mr-2">{slotIdx + 1}.</strong>
                            {team.name}
                          </span>
                          {!isFixedSeeding && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromGroup(groupKey, team);
                              }}
                              className="text-blue-400 hover:text-red-500 text-xs font-bold px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ) : (
                        <div
                          key={`empty-${slotIdx}`}
                          className={`text-xs px-3 py-2 rounded-lg border border-dashed flex items-center ${
                            !isFixedSeeding && selectedTeam
                              ? 'border-amber-300 bg-amber-50/50 text-amber-700'
                              : 'border-gray-200 text-gray-300'
                          }`}
                        >
                          <span className="mr-2 text-gray-300">{slotIdx + 1}.</span>
                          {!isFixedSeeding && selectedTeam
                            ? 'Click to assign selected team'
                            : 'Empty Slot'}
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