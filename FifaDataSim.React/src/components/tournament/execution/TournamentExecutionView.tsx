import { type JSX, useState, useEffect, useMemo, useRef } from 'react';
import { PhaseType } from '../../../types/phaseType';
import { GroupStageExecutionView } from './stages/GroupStageExecutionView';
import { MultiKnockoutDrawView } from './draws/MultiKnockoutDrawView';
import { SingleKnockoutDrawView } from './draws/SingleKnockoutDrawView';
import { SingleKnockoutExecutionView } from './stages/SingleKnockoutExecutionView';
import { GroupStageDrawView } from './draws/GroupStageDrawView';
import type { Phase } from '../../../types/phase';
import type { PhaseCompletionData } from '../../../types/phaseCompletionData';
import type { DrawResult } from '../../../types/drawResult';
import type { Country } from '../../../types/country';
import {
  createFallbackGroupDraw,
  createFallbackSingleKnockoutDraw,
  derivePots,
} from '../../../services/helpers/tournamentExecutionUtils';
import type { GroupStandingEntry } from '../../../types/groupStandingEntry';
import type { KnockoutMatchup } from '../../../types/knockoutMatchup';
import { MultiKnockoutExecutionView } from './stages/MultiKnockoutExecutionView';

export type ExecutionStage = 'DRAW' | 'SIMULATION';

interface TournamentExecutionViewProps {
  phases: Phase[];
  activePhase: Phase;
  currentPhaseIndex: number;
  onNextPhase: (completionData: PhaseCompletionData) => void;
  onExitExecution: () => void;
}

/**
 * Seeded Group Distribution:
 * Sorts teams by default_points or strength and distributes them
 * sequentially across groups.
 */
function generateSeededGroups(
  teams: Country[],
  groupCount: number,
  groupSize: number
): Record<string, Country[]> {
  if (!teams || teams.length === 0) return {};

  const sortedTeams = [...teams].sort((a, b) => {
    const pointsA = a.default_points ?? a.strength ?? 0;
    const pointsB = b.default_points ?? b.strength ?? 0;
    return pointsB - pointsA;
  });

  const numGroups = Math.max(1, groupCount);
  const groupKeys = Array.from({ length: numGroups }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const groups: Record<string, Country[]> = {};
  groupKeys.forEach((key) => {
    groups[key] = [];
  });

  sortedTeams.forEach((team, index) => {
    const groupIndex = index % numGroups;
    const targetGroup = groupKeys[groupIndex];
    if (groups[targetGroup].length < groupSize) {
      groups[targetGroup].push(team);
    }
  });

  return groups;
}

/**
 * Randomly applies a +20 strength buff (capped at 85) to 5% (min 1) of eligible teams.
 * Sets the 'starred' property to true for modified teams.
 */
function applyRandomModifiers(teams: Country[]): Country[] {
  if (!teams || teams.length === 0) return [];

  const eligibleTeams = teams.filter((t) => (t.strength || 0) <= 85);
  if (eligibleTeams.length === 0) return teams; // No eligible teams to modify

  const numToModify = Math.max(1, Math.floor(teams.length * 0.1));
  
  // Shuffle to pick random winners
  const shuffled = [...eligibleTeams].sort(() => 0.5 - Math.random());
  const selectedIds = new Set(shuffled.slice(0, numToModify).map((t) => t.id));

  return teams.map((t) => {
    if (selectedIds.has(t.id)) {
      return {
        ...t,
        isStarred: true,
        strength: Math.min(85, (t.strength || 0) + 30),
      };
    }
    return {
      ...t,
      isStarred: false,
    };
  });
}

/**
 * Reduces strength by 15 and removes the 'starred' state from modified teams 
 * upon phase completion.
 */
function revertTeamModifications(teams: Country[]): Country[] {
  return teams.map((t) => {
    if (t && t.isStarred) {
      return {
        ...t,
        isStarred: false,
        strength: Math.max(0, (t.strength || 0) - 15),
      };
    }
    return t;
  });
}

export function TournamentExecutionView({
  phases,
  activePhase,
  currentPhaseIndex,
  onNextPhase,
  onExitExecution,
}: TournamentExecutionViewProps): JSX.Element {
  // Extract configuration parameters dynamically
  const { groupCount, groupSize } = useMemo(() => {
    const cfg = activePhase.config as Record<string, any> | undefined;
    return {
      groupCount: cfg?.number_of_groups || cfg?.groupCount || 4,
      groupSize: cfg?.group_size || cfg?.groupSize || 4,
    };
  }, [activePhase]);

  // --- MODIFIER LOGIC (Executed once per phase change) ---
  const lastProcessedPhaseId = useRef<string | null>(null);
  const modifiedTeamsRef = useRef<Country[]>([]);

  // Apply modifiers only when navigating to a new phase ID
  const modifiedTeams = useMemo(() => {
    if (lastProcessedPhaseId.current !== activePhase.id) {
      modifiedTeamsRef.current = applyRandomModifiers(activePhase.teams || []);
      lastProcessedPhaseId.current = activePhase.id;
    }
    return modifiedTeamsRef.current;
  }, [activePhase.id, activePhase.teams]);

  // Merge the modified teams back into a working activePhase object. 
  // Explicitly cast to Phase so TS knows it retains discriminated union properties.
  const activePhaseWithModifiedTeams = useMemo<Phase>(() => ({
    ...activePhase,
    teams: modifiedTeams,
  } as Phase), [activePhase, modifiedTeams]);
  // -------------------------------------------------------

  // Determine if this phase skips the draw UI
  const isDrawBypassed = !activePhase.has_draw;

  // Initial draw computation using the modified teams
  const initialAutoDraw = useMemo<DrawResult | null>(() => {
    if (isDrawBypassed && modifiedTeams.length > 0) {
      if (activePhase.type === PhaseType.GroupStage) {
        return {
          type: 'GROUP',
          groups: generateSeededGroups(
            modifiedTeams,
            groupCount,
            groupSize
          ),
        };
      }
    }
    return null;
  }, [isDrawBypassed, modifiedTeams, activePhase.type, groupCount, groupSize]);

  // Local State
  const [stage, setStage] = useState<ExecutionStage>(() =>
    isDrawBypassed ? 'SIMULATION' : 'DRAW'
  );
  const [drawResult, setDrawResult] = useState<DrawResult | null>(initialAutoDraw);
  const [isPhaseCompleted, setIsPhaseCompleted] = useState<boolean>(false);
  const [completionData, setCompletionData] = useState<PhaseCompletionData | null>(null);

  // Sync state whenever activePhase changes
  useEffect(() => {
    setIsPhaseCompleted(false);
    setCompletionData(null);

    if (isDrawBypassed) {
      setStage('SIMULATION');
      if (activePhase.type === PhaseType.GroupStage && modifiedTeams.length > 0) {
        setDrawResult({
          type: 'GROUP',
          groups: generateSeededGroups(
            modifiedTeams,
            groupCount,
            groupSize
          ),
        });
      } else {
        setDrawResult(null);
      }
    } else {
      setStage('DRAW');
      setDrawResult(null);
    }
  }, [
    activePhase.id,
    isDrawBypassed,
    activePhase.type,
    modifiedTeams,
    groupCount,
    groupSize,
  ]);

  // Fallbacks
  const pots = useMemo(() => derivePots(activePhaseWithModifiedTeams), [activePhaseWithModifiedTeams]);

  const fallbackGroupDraw = useMemo(() => {
    if (isDrawBypassed && modifiedTeams.length > 0 && activePhase.type === PhaseType.GroupStage) {
      return generateSeededGroups(
        modifiedTeams,
        groupCount,
        groupSize
      );
    }
    return createFallbackGroupDraw(activePhaseWithModifiedTeams);
  }, [isDrawBypassed, activePhaseWithModifiedTeams, modifiedTeams, groupCount, groupSize]);

  const fallbackSingleKnockoutDraw = useMemo(
    () => createFallbackSingleKnockoutDraw(activePhaseWithModifiedTeams),
    [activePhaseWithModifiedTeams]
  );

  // Handlers
  const handleDrawComplete = (result: DrawResult) => {
    setDrawResult(result);
    setStage('SIMULATION');
  };

  const handleSimulationComplete = (data: PhaseCompletionData) => {
    setCompletionData(data);
    setIsPhaseCompleted(true);
  };

  const handleNextClick = () => {
    if (completionData) {
      onNextPhase(completionData);
    }
  };

  const isNextDisabled =
    (!isDrawBypassed && stage === 'DRAW') || !isPhaseCompleted || !completionData;


  return (
    <div className="w-full px-4 sm:px-6 bg-white border-2 border-blue-500 rounded-2xl shadow-lg overflow-hidden">
      {/* Header Bar */}
      <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider bg-blue-700 px-2.5 py-1 rounded-md text-blue-100">
              Phase {currentPhaseIndex + 1} of {phases.length}
            </span>
            <span
              className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                stage === 'DRAW'
                  ? 'bg-amber-500 text-white'
                  : isPhaseCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-800 text-blue-100'
              }`}
            >
              {stage === 'DRAW'
                ? 'FIFA-Style Draw'
                : isPhaseCompleted
                ? 'Phase Completed'
                : isDrawBypassed
                ? 'Direct Seeding (Pre-assigned)'
                : 'In Simulation'}
            </span>
          </div>

          <h2 className="text-2xl font-bold mt-2">{activePhase.name}</h2>

          <p className="text-xs text-blue-100 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>Tag: <span className="font-semibold">{activePhase.tag}</span></span>
            {' | '}
            <span>Teams Assigned: {modifiedTeams.length}</span>
            {' | '}
            <span>Draw Mode: <span className="font-semibold">{isDrawBypassed ? 'Bypassed (Ranking Seeding)' : 'Manual Draw Enabled'}</span></span>
          </p>

          {/* Optional: Preview snippet of first few team flags if available */}
          {modifiedTeams.length > 0 && (
            <div className="flex items-center gap-1 mt-2 overflow-x-auto py-1 max-w-xl">
              {modifiedTeams.slice(0, 8).map((team) => (
                team.flag_url ? (
                  <img
                    key={team.id || team.name}
                    src={team.flag_url}
                    alt={team.name}
                    title={`${team.name} (STR: ${team.strength})${team.isStarred == true ? ' ⭐' : ''}`}
                    className={`w-5 h-3.5 object-cover rounded-xs shadow-xs shrink-0 ${team.isStarred == true ? 'ring-2 ring-yellow-400' : ''}`}
                  />
                ) : null
              ))}
              {modifiedTeams.length > 8 && (
                <span className="text-[10px] text-blue-200 font-medium ml-1">
                  +{modifiedTeams.length - 8} more
                </span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onExitExecution}
          className="text-xs bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          ✕ Exit Execution
        </button>
      </div>

      {/* Main Execution Body */}
      <div className="p-6">
        {stage === 'DRAW' ? (
          <div>
            {/* NOTICE: We check activePhaseWithModifiedTeams.type here to force TypeScript to narrow this specific object */}
            {activePhaseWithModifiedTeams.type === PhaseType.GroupStage && (
              <GroupStageDrawView
                phase={activePhaseWithModifiedTeams}
                pots={pots}
                onComplete={(res) => handleDrawComplete({ type: 'GROUP', groups: res })}
              />
            )}

            {activePhaseWithModifiedTeams.type === PhaseType.SingleBranchKnockoutStage && (
              <SingleKnockoutDrawView
                phase={activePhaseWithModifiedTeams}
                pots={pots}
                onComplete={(res) => {
                  const matchups: KnockoutMatchup[] = res.map((m, idx) => ({
                    id: `m-${m.matchId || idx + 1}`,
                    matchId: String(m.matchId || idx + 1),
                    roundIndex: 0,
                    roundName: 'Round of 16',
                    teamA: m.teamA || null,
                    teamB: m.teamB || null,
                    isPlayed: false,
                  }));

                  handleDrawComplete({
                    type: 'SINGLE_KNOCKOUT',
                    matchups,
                  });
                }}
              />
            )}

            {activePhaseWithModifiedTeams.type === PhaseType.MultiBranchKnockoutStage && (
              <MultiKnockoutDrawView
                phase={activePhaseWithModifiedTeams}
                pots={pots}
                onComplete={(res) => {
                  const pathAssignments = Object.entries(res).reduce<
                    Record<string, KnockoutMatchup[]>
                  >((acc, [pathKey, teams]) => {
                    const matchups: KnockoutMatchup[] = [];
                    for (let i = 0; i < teams.length; i += 2) {
                      matchups.push({
                        id: `${pathKey}-m${i / 2 + 1}`,
                        matchId: String(i / 2 + 1),
                        roundIndex: 0,
                        roundName: 'Semi-Final',
                        teamA: teams[i] || null,
                        teamB: teams[i + 1] || null,
                        isPlayed: false,
                      });
                    }
                    acc[pathKey] = matchups;
                    return acc;
                  }, {});

                  handleDrawComplete({
                    type: 'MULTI_KNOCKOUT',
                    pathAssignments,
                  });
                }}
              />
            )}
          </div>
        ) : (
          <div>
            {activePhaseWithModifiedTeams.type === PhaseType.GroupStage && (
              <GroupStageExecutionView
                phase={activePhaseWithModifiedTeams}
                groups={
                  (drawResult && drawResult.type === 'GROUP'
                    ? drawResult.groups
                    : fallbackGroupDraw) || {}
                }
                onComplete={(data) => {
                  // Revert modifications prior to dispatching Phase Completion 
                  const formattedStandings = Object.entries(data.standings || {}).reduce<
                    Record<string, GroupStandingEntry[]>
                  >((acc, [groupKey, countries]) => {
                    const revertedCountries = revertTeamModifications(countries);
                    acc[groupKey] = revertedCountries.map((country, idx) => ({
                      team: country,
                      played: 0,
                      won: 0,
                      drawn: 0,
                      lost: 0,
                      goalsFor: 0,
                      goalsAgainst: 0,
                      goalDifference: 0,
                      points: 0,
                      rank: idx + 1,
                    }));
                    return acc;
                  }, {});
                  
                  const revertedWildcards = data.wildcards ? revertTeamModifications(data.wildcards) : undefined;

                  handleSimulationComplete({
                    phaseId: activePhase.id,
                    phaseType: PhaseType.GroupStage,
                    groupStandings: formattedStandings,
                    wildcardQualifiers: revertedWildcards,
                  });
                }}
              />
            )}

            {activePhaseWithModifiedTeams.type === PhaseType.SingleBranchKnockoutStage && (
              <SingleKnockoutExecutionView
                phase={activePhaseWithModifiedTeams}
                initialMatchups={
                  drawResult && drawResult.type === 'SINGLE_KNOCKOUT'
                    ? drawResult.matchups
                    : fallbackSingleKnockoutDraw
                }
                onComplete={(data) => {
                  const winners: Country[] = [
                    data.champion,
                    data.runnerUp,
                    ...(data.thirdPlace ? [data.thirdPlace] : []),
                  ];

                  const revertedWinners = revertTeamModifications(winners);

                  handleSimulationComplete({
                    phaseId: activePhase.id,
                    phaseType: PhaseType.SingleBranchKnockoutStage,
                    knockoutWinners: revertedWinners,
                  });
                }}
              />
            )}
            
            {activePhaseWithModifiedTeams.type === PhaseType.MultiBranchKnockoutStage && (
              <MultiKnockoutExecutionView
                phase={activePhaseWithModifiedTeams}
                pathAssignments={
                  drawResult && drawResult.type === 'MULTI_KNOCKOUT'
                    ? drawResult.pathAssignments
                    : {}
                }
                onComplete={(data) => {
                  const multiWinners = Object.values(data.pathWinners).flatMap((w) => [
                    w.champion,
                    w.runnerUp,
                    ...(w.thirdPlace ? [w.thirdPlace] : []),
                  ]);

                  const revertedWinners = revertTeamModifications(multiWinners);

                  handleSimulationComplete({
                    phaseId: activePhase.id,
                    phaseType: PhaseType.MultiBranchKnockoutStage,
                    knockoutWinners: revertedWinners,
                  });
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {currentPhaseIndex + 1 < phases.length
            ? `Up next: ${phases[currentPhaseIndex + 1].name}`
            : 'Final phase of tournament'}
        </span>

        <button
          type="button"
          onClick={handleNextClick}
          disabled={isNextDisabled}
          className={`text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm ${
            isNextDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
          }`}
        >
          {currentPhaseIndex + 1 === phases.length
            ? 'Finish Tournament & Exit'
            : 'Next Phase →'}
        </button>
      </div>
    </div>
  );
}