import { useState, useMemo, type JSX, useEffect } from 'react';
import { GroupSimulationUtils, type Fixture } from '../../../../services/helpers/groupSimulationUtils';
import type { Country } from '../../../../types/country';
import type { GroupStagePhase } from '../../../../types/tournamentConfiguration';
import type { MatchUpdateDto } from '../../../../types/matchUpdateDto';
import { updateTeamStats } from '../../../../services/teamService';
import { GroupTable } from '../../groupStage/GroupTable';
import { WildcardTable } from '../../groupStage/WildcardTable';
import { FixtureItem } from '../../groupStage/FixtureItem';
import { GroupMatchSimulationEngine } from '../../../../services/groupMatchSimulationService';

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
  const matchImportance = phase?.config?.match_importance ?? 5;

  // 1. Hold groups in local state so we can mutate team forms on simulation
  const [localGroups, setLocalGroups] = useState<Record<string, Country[]>>(() => groups);

  useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

  const [fixtures, setFixtures] = useState<Fixture[]>(() =>
    GroupSimulationUtils.generateGroupFixtures(localGroups, legs)
  );

  const standings = useMemo(
    () => GroupSimulationUtils.computeGroupStandings(localGroups, fixtures),
    [localGroups, fixtures]
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

    const score = GroupMatchSimulationEngine.simulateMatch(nextMatch.homeTeam, nextMatch.awayTeam);

    const matchUpdate: MatchUpdateDto = {
      homeTeamId: nextMatch.homeTeam.id,
      awayTeamId: nextMatch.awayTeam.id,
      homeTeamGoals: score.home,
      awayTeamGoals: score.away,
      importance: matchImportance,
    };

    const homeChar = score.home > score.away ? 'W' : score.home < score.away ? 'L' : 'D';
    const awayChar = score.home < score.away ? 'W' : score.home > score.away ? 'L' : 'D';

    const appendForm = (char: string, current?: string) => {
      const f = current ?? '';
      const updated = f + char;
      return updated.length > 5 ? updated.slice(-5) : updated;
    };

    try {
      await updateTeamStats(matchUpdate);

      // Update local groups state by finding the freshest form string for each team
      setLocalGroups((prevGroups) => {
        const nextGroups: Record<string, Country[]> = {};
        
        for (const [gKey, teamList] of Object.entries(prevGroups)) {
          nextGroups[gKey] = teamList.map((team) => {
            if (team.id === nextMatch.homeTeam!.id) {
              return { ...team, form: appendForm(homeChar, team.form) };
            }
            if (team.id === nextMatch.awayTeam!.id) {
              return { ...team, form: appendForm(awayChar, team.form) };
            }
            return team;
          });
        }
        return nextGroups;
      });

      // Mark fixture as played
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
    // Note: If you want 'Simulate All' to also update forms, apply similar batch state logic here
    setFixtures((prev) =>
      prev.map((f) => {
        if (f.isPlayed || !f.homeTeam || !f.awayTeam) return f;
        const score = GroupMatchSimulationEngine.simulateMatch(f.homeTeam, f.awayTeam);
        return { ...f, homeScore: score.home, awayScore: score.away, isPlayed: true };
      })
    );
  };

  const handleReset = () => {
    setLocalGroups(groups);
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
    <div className="w-full max-w-[150rem] mx-auto px-4 sm:px-6 py-6 space-y-8">
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
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 rounded-xl font-semibold text-xs transition-all cursor-pointer"
          >
            ⚡ Play Next Match
          </button>
          <button
            type="button"
            onClick={handleSimulateAll}
            disabled={isPhaseComplete}
            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer"
          >
            🚀 Simulate All Matches
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold text-xs transition-all cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleConfirmPhase}
            disabled={!isPhaseComplete}
            className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Confirm & Advance
          </button>
        </div>
      </div>

      {/* Main Grid: Standings (9 cols) + Fixtures (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Group Tables + Wildcard Ranking */}
        <div className="lg:col-span-9 space-y-6">
          <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Group Tables</h4>
          <div className="space-y-6 max-h-[850px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  legs={legs}
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
              legs={legs}
            />
          )}
        </div>

        {/* Right Side: Interactive Match Fixtures List */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Match Fixtures</h4>
          <div className="space-y-2.5 max-h-[850px] overflow-y-auto pr-1">
            {fixtures.map((f) => (
              <FixtureItem key={f.id} fixture={f} onScoreChange={handleScoreChange} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}