import { useState, useMemo, type JSX } from 'react';
import { GroupSimulationUtils, type Fixture } from '../../../../services/helpers/groupSimulationUtils';
import type { Country } from '../../../../types/country';
import type { GroupStagePhase } from '../../../../types/tournamentConfiguration';
import { SimulationEngine } from '../../../../services/simulationService';
import type { MatchUpdateDto } from '../../../../types/MatchUpdateDto';
import { updateTeamStats } from '../../../../services/teamService';
import { GroupTable } from '../../groupStage/GroupTable';
import { WildcardTable } from '../../groupStage/WildcardTable';
import { FixtureItem } from '../../groupStage/FixtureItem';

interface GroupStageExecutionViewProps {
  phase: GroupStagePhase;
  groups: Record<string, Country[]>;
  onComplete: (summary: {
    standings: Record<string, Country[]>;
    wildcards: Country[];
  }) => void;
}

export function GroupStageExecutionView({
  phase,
  groups,
  onComplete,
}: GroupStageExecutionViewProps): JSX.Element {
  const legs = phase?.config?.number_of_legs ?? 1;
  const directAdvanceCount = phase?.config?.direct_advance_per_group ?? 2;
  const wildcardIndex = phase?.config?.wildcard_position ?? 0;
  const wildcardCount = phase?.config?.wildcard_teams_count ?? 0;

  const [fixtures, setFixtures] = useState<Fixture[]>(() =>
    GroupSimulationUtils.generateGroupFixtures(groups, legs)
  );

  const standings = useMemo(
    () => GroupSimulationUtils.computeGroupStandings(groups, fixtures),
    [groups, fixtures]
  );

  const wildcardStandings = useMemo(
    () => GroupSimulationUtils.computeWildcardStandings(standings, wildcardIndex),
    [standings, wildcardIndex]
  );

  const { totalMatches, playedMatches, isPhaseComplete } = useMemo(() => {
    const total = fixtures.filter((f) => f.homeTeam && f.awayTeam).length;
    const played = fixtures.filter((f) => f.isPlayed && f.homeTeam && f.awayTeam).length;
    return {
      totalMatches: total,
      playedMatches: played,
      isPhaseComplete: total > 0 && played === total,
    };
  }, [fixtures]);

  const handleSimulateNext = async () => {
    const nextMatch = fixtures.find((f) => !f.isPlayed && f.homeTeam && f.awayTeam);
    if (!nextMatch?.homeTeam || !nextMatch?.awayTeam) return;

    const score = SimulationEngine.simulateMatch(nextMatch.homeTeam, nextMatch.awayTeam);

    const matchUpdate: MatchUpdateDto = {
      homeTeamId: nextMatch.homeTeam.id,
      awayTeamId: nextMatch.awayTeam.id,
      homeTeamGoals: score.home,
      awayTeamGoals: score.away,
      homeTeamStrength: nextMatch.homeTeam.strength,
      awayTeamStrength: nextMatch.awayTeam.strength,
      homeTeamRankingPoints: nextMatch.homeTeam.default_points,
      awayTeamRankingPoints: nextMatch.awayTeam.default_points,
    };

    try {
      await updateTeamStats(matchUpdate);
      setFixtures((prev) =>
        prev.map((f) =>
          f.id === nextMatch.id
            ? { ...f, homeScore: score.home, awayScore: score.away, isPlayed: true }
            : f
        )
      );
    } catch (error) {
      console.error('Failed to update team stats on backend:', error);
    }
  };

  const handleSimulateAll = () => {
    setFixtures((prev) =>
      prev.map((f) => {
        if (f.isPlayed || !f.homeTeam || !f.awayTeam) return f;
        const score = SimulationEngine.simulateMatch(f.homeTeam, f.awayTeam);
        return { ...f, homeScore: score.home, awayScore: score.away, isPlayed: true };
      })
    );
  };

  const handleReset = () => {
    setFixtures(GroupSimulationUtils.generateGroupFixtures(groups, legs));
  };

  const handleScoreChange = (fixtureId: string, side: 'home' | 'away', value: string) => {
    const parsed = parseInt(value, 10);
    const numVal = value === '' || isNaN(parsed) ? null : Math.max(0, parsed);

    setFixtures((prev) =>
      prev.map((f) => {
        if (f.id !== fixtureId) return f;
        const newHome = side === 'home' ? numVal : f.homeScore;
        const newAway = side === 'away' ? numVal : f.awayScore;
        return {
          ...f,
          homeScore: newHome,
          awayScore: newAway,
          isPlayed: newHome !== null && newAway !== null,
        };
      })
    );
  };

  const handleConfirmPhase = () => {
    const finalStandings: Record<string, Country[]> = {};
    Object.entries(standings).forEach(([gKey, rows]) => {
      finalStandings[gKey] = rows.map((r) => r.team);
    });

    const wildcards = wildcardStandings.slice(0, wildcardCount).map((r) => r.team);
    onComplete({ standings: finalStandings, wildcards });
  };

  return (
    <div className="w-full px-4 sm:px-6 py-6 space-y-8">
      {/* Simulation Control Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Group Stage Simulation</h3>
          <p className="text-xs text-gray-500 mt-1">
            Played: <strong className="text-blue-600">{playedMatches}</strong> / {totalMatches} Matches ({legs} Leg{legs > 1 ? 's' : ''})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSimulateNext}
            disabled={isPhaseComplete}
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 rounded-xl font-semibold text-xs transition-all"
          >
            ⚡ Play Next Match
          </button>
          <button
            type="button"
            onClick={handleSimulateAll}
            disabled={isPhaseComplete}
            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 rounded-xl font-semibold text-xs shadow-sm transition-all"
          >
            🚀 Simulate All Matches
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
            disabled={!isPhaseComplete}
            className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 rounded-xl font-bold text-xs shadow-md transition-all"
          >
            Confirm & Advance
          </button>
        </div>
      </div>

      {/* Main Grid: Standings + Fixtures */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Group Tables + Wildcard Ranking */}
        <div className="lg:col-span-7 space-y-6">
          <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Group Tables</h4>
          <div className="space-y-6 max-h-[800px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(standings).map(([groupKey, rows]) => (
                <GroupTable
                  key={groupKey}
                  groupKey={groupKey}
                  rows={rows}
                  standings={standings}
                  fixtures={fixtures}
                  directAdvanceCount={directAdvanceCount}
                  wildcardIndex={wildcardIndex}
                  wildcardCount={wildcardCount}
                />
              ))}
            </div>
          </div>

          {wildcardIndex > 0 && (
            <WildcardTable
              wildcardStandings={wildcardStandings}
              wildcardIndex={wildcardIndex}
              wildcardCount={wildcardCount}
              standings={standings}
              fixtures={fixtures}
              directAdvanceCount={directAdvanceCount}
            />
          )}
        </div>

        {/* Right Side: Interactive Match Fixtures List */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Match Fixtures</h4>
          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
            {fixtures.map((f) => (
              <FixtureItem key={f.id} fixture={f} onScoreChange={handleScoreChange} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}