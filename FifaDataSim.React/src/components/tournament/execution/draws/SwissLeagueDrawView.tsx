import { useMemo, useCallback, type JSX } from 'react';
import type { SwissLeaguePhase } from '../../../../types/tournamentConfiguration';
import type { Country } from '../../../../types/country';
import { DrawUtils } from '../../../../services/helpers/drawUtils';
import { useDrawAssignment } from '../../../../hooks/useDrawAssignment';
import type { Pot } from '../../../../types/pot';
import { getTeamKey } from '../draws/GroupStageDrawView';
import { DrawHeader } from '../draws/DrawHeader';
import { SlotRow } from '../draws/SlotRow';
import { PotSidebar } from '../draws/PotSidebar';

interface SwissLeagueDrawViewProps {
  phase: SwissLeaguePhase;
  pots: Pot[];
  onComplete: (teams: Country[]) => void;
}

export function SwissLeagueDrawView({
  phase,
  pots = [],
  onComplete,
}: SwissLeagueDrawViewProps): JSX.Element {
  const isFixedSeeding = phase?.has_draw === false;
  const matchesPerTeam = phase?.config?.number_of_matches_per_team || 8;

  const totalPotsTeams = useMemo(
    () => pots.reduce((sum, pot) => sum + (pot.teams?.length || 0), 0),
    [pots]
  );

  const totalSlots = useMemo(() => {
    return totalPotsTeams || phase?.teams?.length || 0;
  }, [totalPotsTeams, phase?.teams?.length]);

  const autoDrawSwissTeams = useCallback(() => {
    const randomized = pots.flatMap((pot) => DrawUtils.shuffle(pot.teams || []));
    return { SWISS_TABLE: randomized };
  }, [pots]);

  const {
    drawState,
    setDrawState,
    selectedTeam,
    setSelectedTeam,
    assignedTeamIds,
    isComplete,
    selectTeam,
    handleDrawNextAvailable,
    handleAutoDrawAll,
    handleReset,
    getResult,
  } = useDrawAssignment<Country, Record<string, Country[]>, Country[]>({
    totalTeams: totalSlots,
    initialState: { SWISS_TABLE: [] },

    getAssignedIds: (state) => {
      const ids = new Set<string | number>();
      (state['SWISS_TABLE'] || []).forEach((t) => {
        const key = getTeamKey(t);
        if (key !== undefined && key !== null) ids.add(key);
      });
      return ids;
    },

    assignSingleTeam: (state, team) => {
      const currentList = state['SWISS_TABLE'] || [];
      if (currentList.length >= totalSlots) return state;

      return {
        ...state,
        SWISS_TABLE: [...currentList, team],
      };
    },

    autoDrawAll: autoDrawSwissTeams,
    buildResult: (state) => state['SWISS_TABLE'] || [],
  });

  const swissTeams = drawState['SWISS_TABLE'] || [];
  const isFull = swissTeams.length >= totalSlots;
  const canDropHere = !isFixedSeeding && selectedTeam && !isFull;

  const handleAssignToLeague = () => {
    if (!canDropHere || !selectedTeam) return;
    setDrawState((prev) => ({
      ...prev,
      SWISS_TABLE: [...(prev['SWISS_TABLE'] || []), selectedTeam],
    }));
    setSelectedTeam(null);
  };

  const handleRemoveFromLeague = (team: Country) => {
    if (isFixedSeeding) return;
    const keyToRemove = getTeamKey(team);
    if (keyToRemove === undefined) return;

    setDrawState((prev) => ({
      ...prev,
      SWISS_TABLE: (prev['SWISS_TABLE'] || []).filter((t) => getTeamKey(t) !== keyToRemove),
    }));
  };

  return (
    <div className="space-y-6">
      <DrawHeader
        title={isFixedSeeding ? 'Swiss League Seeding' : 'Swiss Phase Draw'}
        subtitle={`Teams drawn here enter the overall 1-${totalSlots} Swiss League table (${matchesPerTeam} matches/team).`}
        assignedCount={assignedTeamIds.size}
        totalTeams={totalSlots}
        isComplete={isComplete}
        confirmLabel="Lock & Confirm League Roster"
        onDrawNext={isFixedSeeding ? undefined : () => handleDrawNextAvailable(pots)}
        onAutoDraw={handleAutoDrawAll}
        onReset={handleReset}
        onConfirm={() => onComplete(getResult())}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pot Sidebar */}
        <div className="lg:col-span-3">
          <PotSidebar
            pots={pots}
            assignedTeamIds={assignedTeamIds}
            selectedTeam={selectedTeam}
            onSelectTeam={isFixedSeeding ? () => {} : selectTeam}
          />
        </div>

        {/* Master Swiss League Table Container */}
        <div className="lg:col-span-9">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">
              Swiss League Entrants
            </h4>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              {swissTeams.length} / {totalSlots} Enrolled
            </span>
          </div>

          <div
            onClick={handleAssignToLeague}
            className={`bg-white border-2 rounded-xl p-5 shadow-sm transition-all ${
              canDropHere
                ? 'border-dashed border-amber-400 bg-amber-50/20 cursor-pointer hover:border-amber-500'
                : 'border-gray-200'
            }`}
          >
            {/* Multi-column grid for assigned teams */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {Array.from({ length: totalSlots }).map((_, slotIdx) => (
                <SlotRow
                  key={slotIdx}
                  slotIdx={slotIdx}
                  team={swissTeams[slotIdx]}
                  isFixedSeeding={isFixedSeeding}
                  selectedTeam={selectedTeam}
                  onRemove={handleRemoveFromLeague}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}