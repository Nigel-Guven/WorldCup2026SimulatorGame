import { useMemo, useState, type JSX } from "react";
import { SingleKnockoutSimulationUtils, type KnockoutMatch } from "../../../../services/helpers/singleKnockoutSimulationUtils";
import type { Country } from "../../../../types/country";
import type { MultiKnockoutPhase } from "../../../../types/tournamentConfiguration";
import { MultiKnockoutSimulationUtils, type PathState } from "../../../../services/helpers/multiKnockoutSimulationUtils";


interface Props {
  phase: MultiKnockoutPhase;
  pathAssignments: Record<string, { matchId: number; teamA: Country; teamB: Country }[]>;
  onComplete: (results: {
    pathWinners: Record<string, { champion: Country; runnerUp: Country; thirdPlace?: Country }>;
    allMatches: Record<string, KnockoutMatch[]>;
  }) => void;
}

export function MultiKnockoutExecutionView({
  phase,
  pathAssignments,
  onComplete,
}: Props): JSX.Element {
  const legs = phase.config.number_of_legs || 1;
  const pathKeys = useMemo(() => Object.keys(pathAssignments), [pathAssignments]);

  const [activeTab, setActiveTab] = useState<string>(pathKeys[0] || 'Path A');
  const [pathStates, setPathStates] = useState<Record<string, PathState>>(() =>
    MultiKnockoutSimulationUtils.initializeMultiBracket(pathAssignments, phase.config)
  );

  const isAllPathsComplete = useMemo(() => {
    return Object.values(pathStates).every((p) => p.isComplete);
  }, [pathStates]);

  // Play single match within a specific path
  const handlePlayMatch = (pathKey: string, matchId: string) => {
    setPathStates((prev) => {
      const currentPath = prev[pathKey];
      if (!currentPath) return prev;

      const targetMatch = currentPath.matches.find((m) => m.id === matchId);
      if (!targetMatch || !targetMatch.teamA || !targetMatch.teamB || targetMatch.isPlayed) {
        return prev;
      }

      const simulated = SingleKnockoutSimulationUtils.simulateMatch(targetMatch, legs);
      const updatedMatches = currentPath.matches.map((m) =>
        m.id === matchId ? simulated : m
      );

      const propagated = SingleKnockoutSimulationUtils.propagateWinners(updatedMatches);
      const updatedPathState = MultiKnockoutSimulationUtils.updatePathCompletion({
        ...currentPath,
        matches: propagated,
      });

      return { ...prev, [pathKey]: updatedPathState };
    });
  };

  // Simulate active path to completion
  const handleSimulateActivePath = () => {
    setPathStates((prev) => {
      const currentPath = prev[activeTab];
      if (!currentPath || currentPath.isComplete) return prev;

      let currentMatches = [...currentPath.matches];
      let active = true;

      while (active) {
        let playableFound = false;
        for (let i = 0; i < currentMatches.length; i++) {
          const m = currentMatches[i];
          if (!m.isPlayed && m.teamA && m.teamB) {
            currentMatches[i] = SingleKnockoutSimulationUtils.simulateMatch(m, legs);
            currentMatches = SingleKnockoutSimulationUtils.propagateWinners(currentMatches);
            playableFound = true;
            break;
          }
        }
        if (!playableFound) active = false;
      }

      const updatedPathState = MultiKnockoutSimulationUtils.updatePathCompletion({
        ...currentPath,
        matches: currentMatches,
      });

      return { ...prev, [activeTab]: updatedPathState };
    });
  };

  // Simulate all paths to completion
  const handleSimulateAllPaths = () => {
    setPathStates((prev) => {
      const updatedAll: Record<string, PathState> = {};

      Object.entries(prev).forEach(([key, pathState]) => {
        let currentMatches = [...pathState.matches];
        let active = true;

        while (active) {
          let playableFound = false;
          for (let i = 0; i < currentMatches.length; i++) {
            const m = currentMatches[i];
            if (!m.isPlayed && m.teamA && m.teamB) {
              currentMatches[i] = SingleKnockoutSimulationUtils.simulateMatch(m, legs);
              currentMatches = SingleKnockoutSimulationUtils.propagateWinners(currentMatches);
              playableFound = true;
              break;
            }
          }
          if (!playableFound) active = false;
        }

        updatedAll[key] = MultiKnockoutSimulationUtils.updatePathCompletion({
          ...pathState,
          matches: currentMatches,
        });
      });

      return updatedAll;
    });
  };

  const handleReset = () => {
    setPathStates(
      MultiKnockoutSimulationUtils.initializeMultiBracket(pathAssignments, phase.config)
    );
  };

  const handleConfirmPhase = () => {
    const pathWinners: Record<
      string,
      { champion: Country; runnerUp: Country; thirdPlace?: Country }
    > = {};
    const allMatches: Record<string, KnockoutMatch[]> = {};

    Object.entries(pathStates).forEach(([key, state]) => {
      if (state.champion && state.runnerUp) {
        pathWinners[key] = {
          champion: state.champion,
          runnerUp: state.runnerUp,
          thirdPlace: state.thirdPlace || undefined,
        };
      }
      allMatches[key] = state.matches;
    });

    onComplete({ pathWinners, allMatches });
  };

  const activePathState = pathStates[activeTab];

  // Extract round sequence for the active tab
  const activeRounds = useMemo(() => {
    if (!activePathState) return [];
    return Array.from(
      new Set(
        activePathState.matches
          .filter((m) => !m.isThirdPlaceMatch)
          .map((m) => m.roundIndex)
      )
    ).sort((a, b) => a - b);
  }, [activePathState]);

  return (
    <div className="space-y-8">
      {/* Simulation Control Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Multi-Path Knockout Simulation</h3>
          <p className="text-xs text-gray-500 mt-1">
            Running <strong className="text-blue-600">{pathKeys.length} Parallel Paths</strong> ({legs} Leg{legs > 1 ? 's' : ''})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSimulateActivePath}
            disabled={activePathState?.isComplete}
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 rounded-xl font-semibold text-xs transition-all"
          >
            ⚡ Simulate Current Path
          </button>
          <button
            type="button"
            onClick={handleSimulateAllPaths}
            disabled={isAllPathsComplete}
            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 rounded-xl font-semibold text-xs shadow-sm transition-all"
          >
            🚀 Simulate All Paths
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold text-xs transition-all"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleConfirmPhase}
            disabled={!isAllPathsComplete}
            className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 rounded-xl font-bold text-xs shadow-md transition-all"
          >
            Confirm & Advance
          </button>
        </div>
      </div>

      {/* Path Tabs Selector */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto">
        {pathKeys.map((key) => {
          const state = pathStates[key];
          const isSelected = activeTab === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`py-2.5 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                isSelected
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>{key}</span>
              {state?.isComplete && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Completed" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Path Bracket Render */}
      {activePathState && (
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-8 min-w-[800px]">
            {activeRounds.map((roundIdx) => {
              const roundMatches = activePathState.matches.filter(
                (m) => m.roundIndex === roundIdx && !m.isThirdPlaceMatch
              );
              const roundName = roundMatches[0]?.roundName || `Round ${roundIdx + 1}`;

              return (
                <div key={roundIdx} className="flex-1 flex flex-col space-y-4">
                  <h4 className="font-bold text-xs text-center text-gray-500 uppercase tracking-wider bg-gray-100 py-1.5 rounded-lg">
                    {roundName}
                  </h4>

                  <div className="flex flex-col justify-around flex-1 space-y-6">
                    {roundMatches.map((m) => (
                      <PathMatchCard
                        key={m.id}
                        match={m}
                        legs={legs}
                        onPlay={() => handlePlayMatch(activeTab, m.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PathMatchCard({
  match,
  legs,
  onPlay,
}: {
  match: KnockoutMatch;
  legs: number;
  onPlay: () => void;
}) {
  const isPlayable = !match.isPlayed && match.teamA !== null && match.teamB !== null;

  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm transition-all">
      <div className="space-y-2">
        {/* Team A Slot */}
        <div
          className={`flex justify-between items-center text-xs ${
            match.winner?.id === match.teamA?.id && match.isPlayed
              ? 'font-bold text-blue-950'
              : 'text-gray-600'
          }`}
        >
          <span className="truncate max-w-[110px]">
            {match.teamA ? match.teamA.name : 'TBD'}
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            {match.leg1ScoreA !== null && <span>{match.leg1ScoreA}</span>}
            {legs === 2 && match.leg2ScoreA !== null && (
              <span className="text-gray-400">({match.leg2ScoreA})</span>
            )}
            {match.penaltiesA !== null && (
              <span className="text-[10px] text-amber-600 font-bold">p{match.penaltiesA}</span>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 my-1" />

        {/* Team B Slot */}
        <div
          className={`flex justify-between items-center text-xs ${
            match.winner?.id === match.teamB?.id && match.isPlayed
              ? 'font-bold text-blue-950'
              : 'text-gray-600'
          }`}
        >
          <span className="truncate max-w-[110px]">
            {match.teamB ? match.teamB.name : 'TBD'}
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            {match.leg1ScoreB !== null && <span>{match.leg1ScoreB}</span>}
            {legs === 2 && match.leg2ScoreB !== null && (
              <span className="text-gray-400">({match.leg2ScoreB})</span>
            )}
            {match.penaltiesB !== null && (
              <span className="text-[10px] text-amber-600 font-bold">p{match.penaltiesB}</span>
            )}
          </div>
        </div>
      </div>

      {isPlayable && (
        <button
          type="button"
          onClick={onPlay}
          className="mt-3 w-full py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg transition-all"
        >
          Play Match
        </button>
      )}
    </div>
  );
}