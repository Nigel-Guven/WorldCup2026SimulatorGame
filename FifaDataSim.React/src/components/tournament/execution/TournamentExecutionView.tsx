import { type JSX, useState, useEffect, useMemo } from 'react';
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
  createFallbackMultiKnockoutDraw,
  createFallbackSingleKnockoutDraw,
  derivePots,
} from '../../../services/helpers/tournamentExecutionUtils';
import type { GroupStandingEntry } from '../../../types/groupStandingEntry';
import type { KnockoutMatchup } from '../../../types/knockoutMatchup';
import { MultiKnockoutExecutionView } from './stages/MultiKnockoutExecutionView';
import type { MultiKnockoutPhase } from '../../../types/tournamentConfiguration';

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

  // Determine if this phase skips the draw UI (e.g. Direct Seeding / Pre-assigned Groups)
  const isDrawBypassed = !activePhase.has_draw;

  // Initial draw computation for non-draw stages
  const initialAutoDraw = useMemo<DrawResult | null>(() => {
    if (isDrawBypassed && activePhase.teams && activePhase.teams.length > 0) {
      if (activePhase.type === PhaseType.GroupStage) {
        return {
          type: 'GROUP',
          groups: generateSeededGroups(
            activePhase.teams,
            groupCount,
            groupSize
          ),
        };
      }
    }
    return null;
  }, [isDrawBypassed, activePhase.teams, activePhase.type, groupCount, groupSize]);

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
      if (activePhase.type === PhaseType.GroupStage && activePhase.teams) {
        setDrawResult({
          type: 'GROUP',
          groups: generateSeededGroups(
            activePhase.teams,
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
    activePhase.teams,
    groupCount,
    groupSize,
  ]);

  // Fallbacks
  const pots = useMemo(() => derivePots(activePhase), [activePhase]);

  const fallbackGroupDraw = useMemo(() => {
    if (isDrawBypassed && activePhase.teams && activePhase.type === PhaseType.GroupStage) {
      return generateSeededGroups(
        activePhase.teams,
        groupCount,
        groupSize
      );
    }
    return createFallbackGroupDraw(activePhase);
  }, [isDrawBypassed, activePhase, groupCount, groupSize]);

  const fallbackSingleKnockoutDraw = useMemo(
    () => createFallbackSingleKnockoutDraw(activePhase),
    [activePhase]
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

          <p className="text-xs text-blue-100 mt-0.5">
            Tag: <span className="font-semibold">{activePhase.tag}</span>
            {' | '}
            Teams Assigned: {activePhase.teams.length}
            {' | '}
            Draw Mode:{' '}
            <span className="font-semibold">
              {isDrawBypassed ? 'Bypassed (Ranking Seeding)' : 'Manual Draw Enabled'}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onExitExecution}
          className="text-xs bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          ✕ Exit Execution
        </button>
      </div>

      {/* Main Execution Body */}
      <div className="p-6">
        {stage === 'DRAW' ? (
          <div>
            {activePhase.type === PhaseType.GroupStage && (
              <GroupStageDrawView
                phase={activePhase}
                pots={pots}
                onComplete={(res) => handleDrawComplete({ type: 'GROUP', groups: res })}
              />
            )}

            {activePhase.type === PhaseType.SingleBranchKnockoutStage && (
              <SingleKnockoutDrawView
                phase={activePhase}
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

            {activePhase.type === PhaseType.MultiBranchKnockoutStage && (
              <MultiKnockoutDrawView
                phase={activePhase}
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
            {activePhase.type === PhaseType.GroupStage && (
              <GroupStageExecutionView
                phase={activePhase}
                groups={
                  (drawResult && drawResult.type === 'GROUP'
                    ? drawResult.groups
                    : fallbackGroupDraw) || {}
                }
                onComplete={(data) => {
                  const formattedStandings = Object.entries(data.standings || {}).reduce<
                    Record<string, GroupStandingEntry[]>
                  >((acc, [groupKey, countries]) => {
                    acc[groupKey] = countries.map((country, idx) => ({
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

                  handleSimulationComplete({
                    phaseId: activePhase.id,
                    phaseType: PhaseType.GroupStage,
                    groupStandings: formattedStandings,
                    wildcardQualifiers: data.wildcards,
                  });
                }}
              />
            )}

            {activePhase.type === PhaseType.SingleBranchKnockoutStage && (
              <SingleKnockoutExecutionView
                phase={activePhase}
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

                  handleSimulationComplete({
                    phaseId: activePhase.id,
                    phaseType: PhaseType.SingleBranchKnockoutStage,
                    knockoutWinners: winners,
                  });
                }}
              />
            )}
            
            {activePhase.type === PhaseType.MultiBranchKnockoutStage && (
            <MultiKnockoutExecutionView
              phase={activePhase as MultiKnockoutPhase}
              pathAssignments={
                drawResult && drawResult.type === 'MULTI_KNOCKOUT'
                  ? drawResult.pathAssignments
                  : {}
              }
              onComplete={(data) => {
                handleSimulationComplete({
                  phaseId: activePhase.id,
                  phaseType: PhaseType.MultiBranchKnockoutStage,
                  // Map multi-path winners into your phase completion format
                  knockoutWinners: Object.values(data.pathWinners).flatMap((w) => [
                    w.champion,
                    w.runnerUp,
                    ...(w.thirdPlace ? [w.thirdPlace] : []),
                  ]),
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