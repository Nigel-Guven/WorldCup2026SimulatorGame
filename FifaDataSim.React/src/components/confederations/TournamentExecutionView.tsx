import { useState, useEffect, useMemo, type JSX } from 'react';
import type { Country } from '../../types/country';
import type { Phase } from '../../types/tournamentConfig';
import { PhaseType } from '../../types/phaseType';

// Draw Views
import { GroupStageDrawView } from './GroupStageDrawView';
import { SingleKnockoutDrawView } from './SingleKnockoutDrawView';
import { MultiKnockoutDrawView } from './MultiKnockoutDrawView';

// Execution Views
import { GroupStageExecutionView } from './GroupStageExecutionView';
import { SingleKnockoutExecutionView } from './SingleKnockoutExecutionView';
import { MultiKnockoutExecutionView } from './MultiKnockoutExecutionView';

interface TournamentExecutionViewProps {
  phases: Phase[];
  activePhase: Phase;
  currentPhaseIndex: number;
  onNextPhase: () => void;
  onExitExecution: () => void;
}

export type ExecutionStage = 'DRAW' | 'SIMULATION';

export interface Pot {
  id: number;
  name: string;
  teams: Country[];
}

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

  const [drawResult, setDrawResult] = useState<any | null>(null);
  const [isPhaseCompleted, setIsPhaseCompleted] = useState<boolean>(false);

  // Reset execution stage state when active phase changes
  useEffect(() => {
    setStage(activePhase.has_draw ? 'DRAW' : 'SIMULATION');
    setDrawResult(null);
    setIsPhaseCompleted(false);
  }, [activePhase.id, activePhase.has_draw]);

  // Derive pots automatically from active phase settings
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

    // Single Branch Knockout: Pot 1 & Pot 2
    const half = Math.ceil(activePhase.teams.length / 2);
    return [
      { id: 1, name: 'Pot 1 (Seeded)', teams: activePhase.teams.slice(0, half) },
      { id: 2, name: 'Pot 2 (Unseeded)', teams: activePhase.teams.slice(half) },
    ];
  }, [activePhase]);

  // Fallback initial structures if manual draw is bypassed (has_draw = false)
  const fallbackGroupDraw = useMemo(() => {
    if (activePhase.type !== PhaseType.GroupStage) return null;
    const groupCount = activePhase.config.number_of_groups || 1;
    const groups: Record<string, Country[]> = {};

    for (let i = 0; i < groupCount; i++) {
      const key = String.fromCharCode(65 + i); // Group A, B, C...
      groups[key] = [];
    }

    activePhase.teams.forEach((team, idx) => {
      const groupKey = String.fromCharCode(65 + (idx % groupCount));
      groups[groupKey]?.push(team);
    });

    return groups;
  }, [activePhase]);

  const fallbackSingleKnockoutDraw = useMemo(() => {
    if (activePhase.type !== PhaseType.SingleBranchKnockoutStage) return [];
    const matchups: { matchId: number; teamA: Country; teamB: Country }[] = [];
    const teams = [...activePhase.teams];

    for (let i = 0; i < teams.length; i += 2) {
      if (teams[i] && teams[i + 1]) {
        matchups.push({
          matchId: Math.floor(i / 2) + 1,
          teamA: teams[i],
          teamB: teams[i + 1],
        });
      }
    }

    return matchups;
  }, [activePhase]);

  const fallbackMultiKnockoutDraw = useMemo(() => {
    if (activePhase.type !== PhaseType.MultiBranchKnockoutStage) return {};
    const pathCount = activePhase.config.number_of_paths || 1;
    const paths: Record<string, { matchId: number; teamA: Country; teamB: Country }[]> = {};

    for (let p = 0; p < pathCount; p++) {
      const pathKey = `Path ${String.fromCharCode(65 + p)}`;
      paths[pathKey] = [];
    }

    const pathKeys = Object.keys(paths);
    const teams = [...activePhase.teams];

    for (let i = 0; i < teams.length; i += 2) {
      if (teams[i] && teams[i + 1]) {
        const targetPath = pathKeys[(i / 2) % pathCount];
        paths[targetPath]?.push({
          matchId: paths[targetPath].length + 1,
          teamA: teams[i],
          teamB: teams[i + 1],
        });
      }
    }

    return paths;
  }, [activePhase]);

  const handleDrawComplete = (result: any) => {
    setDrawResult(result);
    setStage('SIMULATION');
  };

  const handleSimulationComplete = () => {
    setIsPhaseCompleted(true);
  };

  const isNextDisabled = (activePhase.has_draw && stage === 'DRAW') || !isPhaseCompleted;

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
                onComplete={handleDrawComplete}
              />
            )}

            {activePhase.type === PhaseType.SingleBranchKnockoutStage && (
              <SingleKnockoutDrawView
                phase={activePhase}
                pots={pots}
                onComplete={handleDrawComplete}
              />
            )}

            {activePhase.type === PhaseType.MultiBranchKnockoutStage && (
              <MultiKnockoutDrawView
                phase={activePhase}
                pots={pots}
                onComplete={handleDrawComplete}
              />
            )}
          </div>
        ) : (
          /* Live Interactive Simulation Workspace */
          <div>
            {activePhase.type === PhaseType.GroupStage && (
              <GroupStageExecutionView
                phase={activePhase}
                groups={drawResult?.groups || fallbackGroupDraw}
                onComplete={handleSimulationComplete}
              />
            )}

            {activePhase.type === PhaseType.SingleBranchKnockoutStage && (
              <SingleKnockoutExecutionView
                phase={activePhase}
                initialMatchups={drawResult?.matchups || fallbackSingleKnockoutDraw}
                onComplete={handleSimulationComplete}
              />
            )}

            {activePhase.type === PhaseType.MultiBranchKnockoutStage && (
              <MultiKnockoutExecutionView
                phase={activePhase}
                pathAssignments={drawResult?.pathAssignments || fallbackMultiKnockoutDraw}
                onComplete={handleSimulationComplete}
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
          onClick={onNextPhase}
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