import { type JSX, useMemo, useRef } from 'react';
import { PhaseType } from '../../../types/phaseType';
import { GroupStageExecutionView } from './stages/GroupStageExecutionView';
import { SingleKnockoutExecutionView } from './stages/SingleKnockoutExecutionView';
import { MultiKnockoutExecutionView } from './stages/MultiKnockoutExecutionView';
import { GroupStageDrawView } from './draws/GroupStageDrawView';
import { SingleKnockoutDrawView } from './draws/SingleKnockoutDrawView';
import { MultiKnockoutDrawView } from './draws/MultiKnockoutDrawView';
import { SwissLeagueDrawView } from './draws/SwissLeagueDrawView';
import type { Phase } from '../../../types/phase';
import type { PhaseCompletionData } from '../../../types/phaseCompletionData';
import type { Country } from '../../../types/country';
import type { KnockoutMatchup } from '../../../types/knockoutMatchup';
import {
  createFallbackSingleKnockoutDraw,
  derivePots,
} from '../../../services/helpers/tournamentExecutionUtils';
import type { TournamentExecutionState } from '../../../hooks/useTournamentExecution';
import { SwissLeagueExecutionView } from './stages/SwissLeagueExecutionView';

interface TournamentExecutionViewProps {
  phases: Phase[];
  execution: TournamentExecutionState;
  onNextPhase: (completionData: PhaseCompletionData) => void;
  onExitExecution: () => void;
}

// --- Local Helpers for Team Buffs / Modifiers ---
function applyRandomModifiers(teams: Country[]): Country[] {
  if (!teams || teams.length === 0) return [];
  const eligibleTeams = teams.filter((t) => (t.strength || 0) <= 85);
  if (eligibleTeams.length === 0) return teams;
  
  const numToModify = Math.max(1, Math.floor(teams.length * 0.1));
  const shuffled = [...eligibleTeams].sort(() => 0.5 - Math.random());
  const selectedIds = new Set(shuffled.slice(0, numToModify).map((t) => t.id));

  return teams.map((t) => selectedIds.has(t.id) ? { ...t, isStarred: true, strength: Math.min(85, (t.strength || 0) + 30) } : { ...t, isStarred: false });
}

function revertTeamModifications(teams: Country[]): Country[] {
  return teams.map((t) => t && t.isStarred ? { ...t, isStarred: false, strength: Math.max(0, (t.strength || 0) - 15) } : t);
}

function generateSeededGroups(teams: Country[], groupCount: number, groupSize: number): Record<string, Country[]> {
  if (!teams || teams.length === 0) return {};
  const sortedTeams = [...teams].sort((a, b) => (b.default_points ?? b.strength ?? 0) - (a.default_points ?? a.strength ?? 0));
  const numGroups = Math.max(1, groupCount);
  const groupKeys = Array.from({ length: numGroups }, (_, i) => String.fromCharCode(65 + i));
  const groups: Record<string, Country[]> = {};
  groupKeys.forEach((key) => { groups[key] = []; });

  sortedTeams.forEach((team, index) => {
    const targetGroup = groupKeys[index % numGroups];
    if (groups[targetGroup].length < groupSize) {
      groups[targetGroup].push(team);
    }
  });
  return groups;
}

export function TournamentExecutionView({
  phases,
  execution,
  onNextPhase,
  onExitExecution,
}: TournamentExecutionViewProps): JSX.Element {
  const { activePhase, currentPhaseIndex, stage, drawResult, isPhaseCompleted, completionData, completeDraw, completeSimulation } = execution;

  // --- Modifier State Ref Tracking ---
  const lastProcessedPhaseId = useRef<string | null>(null);
  const modifiedTeamsRef = useRef<Country[]>([]);

  const modifiedTeams = useMemo(() => {
    if (!activePhase) return [];
    if (lastProcessedPhaseId.current !== activePhase.id) {
      modifiedTeamsRef.current = applyRandomModifiers(activePhase.teams || []);
      lastProcessedPhaseId.current = activePhase.id;
    }
    return modifiedTeamsRef.current;
  }, [activePhase?.id, activePhase?.teams]);

  const activePhaseWithModifiedTeams = useMemo<Phase | null>(() => {
    if (!activePhase) return null;
    return { ...activePhase, teams: modifiedTeams } as Phase;
  }, [activePhase, modifiedTeams]);

  // Group config extraction helpers
  const { groupCount, groupSize } = useMemo(() => {
    const cfg = activePhase?.config as Record<string, any> | undefined;
    return {
      groupCount: cfg?.number_of_groups || cfg?.groupCount || 4,
      groupSize: cfg?.group_size || cfg?.groupSize || 4,
    };
  }, [activePhase]);

  const isDrawBypassed = !activePhase?.has_draw;
  const pots = useMemo(() => activePhaseWithModifiedTeams ? derivePots(activePhaseWithModifiedTeams) : [], [activePhaseWithModifiedTeams]);

  if (!activePhase || !activePhaseWithModifiedTeams) return <></>;

  const isNextDisabled = (!isDrawBypassed && stage === 'DRAW') || !isPhaseCompleted || !completionData;

  return (
    <div className="w-full px-4 sm:px-6 bg-white border-2 border-blue-500 rounded-2xl shadow-lg overflow-hidden">
      {/* Header Bar */}
      <div className="bg-blue-600 text-white p-8 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wider bg-blue-700 px-3 py-1.5 rounded-lg text-blue-100">
                Phase {currentPhaseIndex + 1} of {phases.length}
              </span>
              <span className={`text-sm font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg ${
                stage === 'DRAW' ? 'bg-amber-500 text-white' : isPhaseCompleted ? 'bg-emerald-600 text-white' : 'bg-blue-800 text-blue-100'
              }`}>
                {stage === 'DRAW' ? 'FIFA-Style Draw' : isPhaseCompleted ? 'Phase Completed' : isDrawBypassed ? 'Direct Seeding' : 'In Simulation'}
              </span>
            </div>
            <h2 className="text-4xl font-extrabold mt-3">{activePhase.name}</h2>
          </div>
          <button type="button" onClick={onExitExecution} className="text-sm bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer font-medium">
            ✕ Exit Execution
          </button>
        </div>

        {/* Team Flags Bar */}
        {modifiedTeams.length > 0 && (
          <div className="grid grid-cols-[repeat(32,minmax(0,1fr))] gap-2 w-full bg-blue-900/40 p-4 rounded-2xl border border-blue-500/30">
            {modifiedTeams.map((team) => (
              <div key={team.id || team.name} className="flex items-center justify-center">
                {team.flag_url ? (
                  <img src={team.flag_url} alt={team.name} title={`${team.name} (STR: ${team.strength})${team.isStarred ? ' ⭐' : ''}`} className={`w-10 h-7 object-cover rounded shadow-xs hover:scale-125 transition-transform duration-150 ${team.isStarred ? 'ring-2 ring-yellow-400' : ''}`} />
                ) : (
                  <span className="text-xs">🏳️</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Execution Body */}
      <div className="p-6">
        {stage === 'DRAW' ? (
          <div>
            {activePhaseWithModifiedTeams.type === PhaseType.GroupStage && (
              <GroupStageDrawView phase={activePhaseWithModifiedTeams} pots={pots} onComplete={(res) => completeDraw({ type: 'GROUP', groups: res })} />
            )}
            
            {activePhaseWithModifiedTeams.type === PhaseType.SwissLeagueStage && (
              <SwissLeagueDrawView
                phase={activePhaseWithModifiedTeams as any}
                pots={pots}
                onComplete={(teams) => completeDraw({ type: 'SWISS_LEAGUE' as any, teams } as any)}
              />
            )}

            {activePhaseWithModifiedTeams.type === PhaseType.SingleBranchKnockoutStage && (
              <SingleKnockoutDrawView phase={activePhaseWithModifiedTeams} pots={pots} onComplete={(res) => {
                const matchups: KnockoutMatchup[] = res.map((m, idx) => ({
                  id: `m-${m.matchId || idx + 1}`,
                  matchId: String(m.matchId || idx + 1),
                  roundIndex: 0,
                  roundName: 'Round of 16',
                  teamA: m.teamA || null,
                  teamB: m.teamB || null,
                  isPlayed: false,
                }));
                completeDraw({ type: 'SINGLE_KNOCKOUT', matchups });
              }} />
            )}
            {activePhaseWithModifiedTeams.type === PhaseType.MultiBranchKnockoutStage && (
              <MultiKnockoutDrawView phase={activePhaseWithModifiedTeams} pots={pots} onComplete={(res) => {
                const pathAssignments = Object.entries(res).reduce<Record<string, KnockoutMatchup[]>>((acc, [pathKey, teams]) => {
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
                completeDraw({ type: 'MULTI_KNOCKOUT', pathAssignments });
              }} />
            )}
          </div>
        ) : (
          <div>
            {activePhaseWithModifiedTeams.type === PhaseType.GroupStage && (
              <GroupStageExecutionView
                phase={activePhaseWithModifiedTeams}
                groups={drawResult?.type === 'GROUP' ? drawResult.groups : generateSeededGroups(modifiedTeams, groupCount, groupSize)}
                onComplete={(data) => {
                  const formattedStandings = Object.entries(data.standings || {}).reduce<Record<string, any>>((acc, [groupKey, countries]) => {
                    const reverted = revertTeamModifications(countries as Country[]);
                    acc[groupKey] = reverted.map((team, idx) => ({ team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, rank: idx + 1 }));
                    return acc;
                  }, {});
                  completeSimulation({
                    phaseId: activePhase.id,
                    phaseType: PhaseType.GroupStage,
                    groupStandings: formattedStandings,
                    wildcardQualifiers: data.wildcards ? revertTeamModifications(data.wildcards) : undefined,
                  });
                }}
              />
            )}

            {activePhaseWithModifiedTeams.type === PhaseType.SwissLeagueStage && (
              <SwissLeagueExecutionView
                phase={activePhaseWithModifiedTeams as any}
                teams={
                  (drawResult as any)?.teams ||
                  modifiedTeams
                }
                onComplete={(data) => {
                  const revertedStandings = revertTeamModifications(data.standings);
                  const revertedPlayoffs = data.playoffs ? revertTeamModifications(data.playoffs) : undefined;

                  completeSimulation({
                    phaseId: activePhase.id,
                    phaseType: PhaseType.GroupStage, // Map to appropriate PhaseCompletion type if needed
                    groupStandings: { SWISS_TABLE: revertedStandings.map((team, idx) => ({ team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, rank: idx + 1 })) },
                    wildcardQualifiers: revertedPlayoffs,
                  });
                }}
              />
            )}
            
            {activePhaseWithModifiedTeams.type === PhaseType.SingleBranchKnockoutStage && (
              <SingleKnockoutExecutionView
                phase={activePhaseWithModifiedTeams}
                initialMatchups={drawResult?.type === 'SINGLE_KNOCKOUT' ? drawResult.matchups : createFallbackSingleKnockoutDraw(activePhaseWithModifiedTeams)}
                onComplete={(data) => {
                  const winners = revertTeamModifications([data.champion, data.runnerUp, ...(data.thirdPlace ? [data.thirdPlace] : [])]);
                  completeSimulation({ phaseId: activePhase.id, phaseType: PhaseType.SingleBranchKnockoutStage, knockoutWinners: winners });
                }}
              />
            )}

            {activePhaseWithModifiedTeams.type === PhaseType.MultiBranchKnockoutStage && (
              <MultiKnockoutExecutionView
                phase={activePhaseWithModifiedTeams}
                pathAssignments={drawResult?.type === 'MULTI_KNOCKOUT' ? drawResult.pathAssignments : {}}
                onComplete={(data) => {
                  const multiWinners = Object.values(data.pathWinners).flatMap((w) => [w.champion, w.runnerUp, ...(w.thirdPlace ? [w.thirdPlace] : [])]);
                  completeSimulation({ phaseId: activePhase.id, phaseType: PhaseType.MultiBranchKnockoutStage, knockoutWinners: revertTeamModifications(multiWinners) });
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {currentPhaseIndex + 1 < phases.length ? `Up next: ${phases[currentPhaseIndex + 1].name}` : 'Final phase of tournament'}
        </span>
        <button
          type="button"
          onClick={() => completionData && onNextPhase(completionData)}
          disabled={isNextDisabled}
          className={`text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm ${
            isNextDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
          }`}
        >
          {currentPhaseIndex + 1 === phases.length ? 'Finish Tournament & Exit' : 'Next Phase →'}
        </button>
      </div>
    </div>
  );
}