import { useState, useEffect, useMemo, type JSX } from 'react';
import type { Country } from '../../../types/country';
import { PhaseType } from '../../../types/phaseType';
import { GroupStageExecutionView } from './stages/GroupStageExecutionView';
import { MultiKnockoutDrawView } from './draws/MultiKnockoutDrawView';
import { SingleKnockoutDrawView } from './draws/SingleKnockoutDrawView';
import { SingleKnockoutExecutionView } from './stages/SingleKnockoutExecutionView';
import { MultiKnockoutExecutionView } from './stages/MultiKnockoutExecutionView';
import { GroupStageDrawView } from './draws/GroupStageDrawView';
import type { Phase } from '../../../types/phase';

// ==========================================
// Types & Domain Interfaces
// ==========================================

export type ExecutionStage = 'DRAW' | 'SIMULATION';

export interface Pot {
  id: number;
  name: string;
  teams: Country[];
}

export interface KnockoutMatchup {
  matchId: number;
  teamA: Country;
  teamB?: Country;
}

export type DrawResult =
  | { type: 'GROUP'; groups: Record<string, Country[]> }
  | { type: 'SINGLE_KNOCKOUT'; matchups: KnockoutMatchup[] }
  | { type: 'MULTI_KNOCKOUT'; pathAssignments: Record<string, KnockoutMatchup[]> };

export interface GroupStandingEntry {
  team: Country;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface PhaseCompletionData {
  phaseId: string;
  phaseType: PhaseType;
  groupStandings?: Record<string, GroupStandingEntry[]>;
  knockoutWinners?: Country[];
  pathWinners?: Record<string, Country[]>;
}

interface TournamentExecutionViewProps {
  phases: Phase[];
  activePhase: Phase;
  currentPhaseIndex: number;
  onNextPhase: (completionData: PhaseCompletionData) => void;
  onExitExecution: () => void;
}

// ==========================================
// Component Implementation
// ==========================================

export function TournamentExecutionView({
  phases,
  activePhase,
  currentPhaseIndex,
  onNextPhase,
  onExitExecution,
}: TournamentExecutionViewProps): JSX.Element {
  const [stage, setStage] = useState<ExecutionStage>(() =>
    activePhase.has_draw ? 'DRAW' : 'SIMULATION'
  );

  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [isPhaseCompleted, setIsPhaseCompleted] = useState<boolean>(false);
  const [completionData, setCompletionData] = useState<PhaseCompletionData | null>(null);

  // Reset local state when active phase changes
  useEffect(() => {
    setStage(activePhase.has_draw ? 'DRAW' : 'SIMULATION');
    setDrawResult(null);
    setIsPhaseCompleted(false);
    setCompletionData(null);
  }, [activePhase.id, activePhase.has_draw]);

  // ------------------------------------------
  // Pot Derivation
  // ------------------------------------------
  const pots = useMemo<Pot[]>(() => {
    if (!activePhase.teams.length) return [];

    if (activePhase.type === PhaseType.GroupStage) {
      const groupCount = activePhase.config.number_of_groups || 1;
      const groupSize = activePhase.config.group_size || 4;
      const potCount = Math.max(groupSize, Math.ceil(activePhase.teams.length / groupCount));

      const derivedPots: Pot[] = Array.from({ length: potCount }, (_, i) => ({
        id: i + 1,
        name: `Pot ${i + 1}`,
        teams: [],
      }));

      activePhase.teams.forEach((team, index) => {
        const potIndex = Math.floor(index / groupCount);
        if (derivedPots[potIndex]) {
          derivedPots[potIndex].teams.push(team);
        }
      });

      return derivedPots;
    }

    if (activePhase.type === PhaseType.MultiBranchKnockoutStage) {
      const pathCount = activePhase.config.number_of_paths || 1;
      const derivedPots: Pot[] = Array.from({ length: pathCount }, (_, i) => ({
        id: i + 1,
        name: `Path ${i + 1} Seed Pool`,
        teams: [],
      }));

      activePhase.teams.forEach((team, index) => {
        const potIndex = index % pathCount;
        derivedPots[potIndex]?.teams.push(team);
      });

      return derivedPots;
    }

    // Single Branch Knockout
    const half = Math.ceil(activePhase.teams.length / 2);
    return [
      { id: 1, name: 'Pot 1 (Seeded)', teams: activePhase.teams.slice(0, half) },
      { id: 2, name: 'Pot 2 (Unseeded)', teams: activePhase.teams.slice(half) },
    ];
  }, [activePhase]);

  // ------------------------------------------
  // Fallback Draws (When has_draw = false)
  // ------------------------------------------
  const fallbackGroupDraw = useMemo(() => {
    if (activePhase.type !== PhaseType.GroupStage) return null;
    const groupCount = activePhase.config.number_of_groups || 1;
    const groups: Record<string, Country[]> = {};

    for (let i = 0; i < groupCount; i++) {
      const key = String.fromCharCode(65 + i);
      groups[key] = [];
    }

    activePhase.teams.forEach((team, idx) => {
      const groupKey = String.fromCharCode(65 + (idx % groupCount));
      groups[groupKey]?.push(team);
    });

    return groups;
  }, [activePhase]);

  const fallbackSingleKnockoutDraw = useMemo<KnockoutMatchup[]>(() => {
    if (activePhase.type !== PhaseType.SingleBranchKnockoutStage) return [];
    const matchups: KnockoutMatchup[] = [];
    const teams = [...activePhase.teams];

    for (let i = 0; i < teams.length; i += 2) {
      matchups.push({
        matchId: Math.floor(i / 2) + 1,
        teamA: teams[i],
        teamB: teams[i + 1] ?? undefined,
      });
    }

    return matchups;
  }, [activePhase]);

  const fallbackMultiKnockoutDraw = useMemo(() => {
    if (activePhase.type !== PhaseType.MultiBranchKnockoutStage) return {};
    const pathCount = activePhase.config.number_of_paths || 1;
    const paths: Record<string, KnockoutMatchup[]> = {};

    for (let p = 0; p < pathCount; p++) {
      const pathKey = `Path ${String.fromCharCode(65 + p)}`;
      paths[pathKey] = [];
    }

    const pathKeys = Object.keys(paths);
    const teams = [...activePhase.teams];

    for (let i = 0; i < teams.length; i += 2) {
      const targetPath = pathKeys[Math.floor(i / 2) % pathCount];
      if (targetPath) {
        paths[targetPath].push({
          matchId: paths[targetPath].length + 1,
          teamA: teams[i],
          teamB: teams[i + 1] ?? undefined,
        });
      }
    }

    return paths;
  }, [activePhase]);

  // ------------------------------------------
  // Event Handlers
  // ------------------------------------------
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

  const isNextDisabled = (activePhase.has_draw && stage === 'DRAW') || !isPhaseCompleted || !completionData;

  return (
    <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-lg overflow-hidden max-w-6xl mx-auto">
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
              {activePhase.has_draw ? 'Manual Draw Enabled' : 'Bypassed (Direct Placement)'}
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
                onComplete={(res) => handleDrawComplete({ type: 'SINGLE_KNOCKOUT', matchups: res })}
              />
            )}

            {activePhase.type === PhaseType.MultiBranchKnockoutStage && (
              <MultiKnockoutDrawView
                phase={activePhase}
                pots={pots}
                onComplete={(res) => handleDrawComplete({ type: 'MULTI_KNOCKOUT', pathAssignments: res })}
              />
            )}
          </div>
        ) : (
          <div>
            {activePhase.type === PhaseType.GroupStage && (
              <GroupStageExecutionView
                phase={activePhase}
                groups={
                  drawResult && drawResult.type === 'GROUP'
                    ? drawResult.groups
                    : fallbackGroupDraw
                }
                onComplete={(data) =>
                  handleSimulationComplete({
                    phaseId: activePhase.id,
                    phaseType: PhaseType.GroupStage,
                    groupStandings: data,
                  })
                }
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
                onComplete={(data) =>
                  handleSimulationComplete({
                    phaseId: activePhase.id,
                    phaseType: PhaseType.SingleBranchKnockoutStage,
                    knockoutWinners: data,
                  })
                }
              />
            )}

            {activePhase.type === PhaseType.MultiBranchKnockoutStage && (
              <MultiKnockoutExecutionView
                phase={activePhase}
                pathAssignments={
                  drawResult && drawResult.type === 'MULTI_KNOCKOUT'
                    ? drawResult.pathAssignments
                    : fallbackMultiKnockoutDraw
                }
                onComplete={(data) =>
                  handleSimulationComplete({
                    phaseId: activePhase.id,
                    phaseType: PhaseType.MultiBranchKnockoutStage,
                    pathWinners: data,
                  })
                }
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