import { useCallback, type JSX } from 'react';
import { useDrawAssignment } from '../../hooks/useDrawAssignment';
import { DrawUtils } from '../../services/helpers/drawUtils';
import type { Country } from '../../types/country';
import type { SingleKnockoutPhase } from '../../types/tournamentConfig';
import { DrawHeader } from './DrawHeader';
import { PotSidebar } from './PotSidebar';
import type { Pot } from './TournamentExecutionView';

export interface KnockoutMatchup {
  matchId: number;
  teamA: Country | null;
  teamB: Country | null;
}

interface Props {
  phase: SingleKnockoutPhase;
  pots: Pot[];
  onComplete: (matchups: { matchId: number; teamA: Country; teamB: Country }[]) => void;
}

export function SingleKnockoutDrawView({ phase, pots, onComplete }: Props): JSX.Element {
  const totalTeams = phase.teams.length;
  const matchCount = Math.ceil(totalTeams / 2);

  const initialMatchups = useCallback(
    () =>
      Array.from({ length: matchCount }, (_, i) => ({
        matchId: i + 1,
        teamA: null,
        teamB: null,
      })),
    [matchCount]
  );

  const {
    drawState: matchups,
    setDrawState: setMatchups,
    selectedTeam,
    assignedTeamIds,
    isComplete,
    selectTeam,
    handleDrawNextAvailable,
    handleAutoDrawAll,
    handleReset,
    getResult,
  } = useDrawAssignment<Country, KnockoutMatchup[], { matchId: number; teamA: Country; teamB: Country }[]>({
    totalTeams,
    initialState: initialMatchups(),
    getAssignedIds: (ms: KnockoutMatchup[]) => {
      const ids = new Set<string | number>();
      ms.forEach((m) => {
        if (m.teamA?.id !== undefined) ids.add(m.teamA.id);
        if (m.teamB?.id !== undefined) ids.add(m.teamB.id);
      });
      return ids;
    },

    // Pot-aware single assignment
    assignSingleTeam: (ms: KnockoutMatchup[], team: Country) => {
      const updated = ms.map((m) => ({ ...m }));
      const isPot1 = pots[0]?.teams.some((t) => String(t.id) === String(team.id));

      if (isPot1) {
        // Place Pot 1 (Seeded) teams into the first open Slot A
        const match = updated.find((m) => !m.teamA);
        if (match) match.teamA = team;
      } else {
        // Place Pot 2 (Unseeded) teams into the first open Slot B
        const match = updated.find((m) => !m.teamB);
        if (match) match.teamB = team;
      }

      return updated;
    },

    // Shuffle both pots before pairing
    autoDrawAll: () => {
      const pot1Shuffled = DrawUtils.shuffle(pots[0]?.teams || []);
      const pot2Shuffled = DrawUtils.shuffle(pots[1]?.teams || []);
      return DrawUtils.pairSeededKnockout(pot1Shuffled, pot2Shuffled, matchCount);
    },

    buildResult: (ms: KnockoutMatchup[]) =>
      ms.filter(
        (m): m is { matchId: number; teamA: Country; teamB: Country } =>
          m.teamA !== null && m.teamB !== null
      ),
  });

  const handleAssignToMatch = (matchId: number, slot: 'A' | 'B') => {
    if (!selectedTeam) return;
    setMatchups((prev) =>
      prev.map((m) =>
        m.matchId === matchId
          ? { ...m, [slot === 'A' ? 'teamA' : 'teamB']: selectedTeam }
          : m
      )
    );
    selectTeam(selectedTeam);
  };

  const handleRemoveFromMatch = (matchId: number, slot: 'A' | 'B') => {
    setMatchups((prev) =>
      prev.map((m) =>
        m.matchId === matchId
          ? { ...m, [slot === 'A' ? 'teamA' : 'teamB']: null }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      <DrawHeader
        title="Knockout Bracket Draw"
        subtitle="Pair Pot 1 (Seeded) teams against Pot 2 (Unseeded) teams in the initial round."
        assignedCount={assignedTeamIds.size}
        totalTeams={totalTeams}
        isComplete={isComplete}
        confirmLabel="Lock Bracket"
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
            First Round Matchups
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchups.map((m) => (
              <div key={m.matchId} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Match {m.matchId}
                </span>
                <div className="mt-2 space-y-2">
                  <SlotBox
                    team={m.teamA}
                    label="Slot 1 (Seeded)"
                    onClick={() => handleAssignToMatch(m.matchId, 'A')}
                    onRemove={() => handleRemoveFromMatch(m.matchId, 'A')}
                  />
                  <div className="text-center text-[10px] text-gray-300 font-bold uppercase">VS</div>
                  <SlotBox
                    team={m.teamB}
                    label="Slot 2 (Unseeded)"
                    onClick={() => handleAssignToMatch(m.matchId, 'B')}
                    onRemove={() => handleRemoveFromMatch(m.matchId, 'B')}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlotBox({
  team,
  label,
  onClick,
  onRemove,
}: {
  team: Country | null;
  label: string;
  onClick: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-2.5 rounded-lg border text-xs flex justify-between items-center transition-colors ${
        team
          ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
          : 'border-dashed border-gray-200 text-gray-400 cursor-pointer hover:border-amber-400 hover:bg-amber-50/20'
      }`}
    >
      <span>{team ? team.name : label}</span>
      {team && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-blue-400 hover:text-red-500 font-bold text-xs ml-2 px-1"
        >
          ✕
        </button>
      )}
    </div>
  );
}