import { useState, useMemo, type JSX, useEffect } from 'react';
import type { Country } from '../../../../types/country';
import type { SwissLeaguePhase } from '../../../../types/tournamentConfiguration';
import type { MatchUpdateDto } from '../../../../types/matchUpdateDto';
import { updateTeamStats } from '../../../../services/teamService';
import { GroupMatchSimulationEngine } from '../../../../services/groupMatchSimulationService';
import { FixtureItem } from '../../groupStage/FixtureItem';
import { SwissSimulationUtils, type SwissFixture } from '../../../../services/helpers/swissLeagueSimulationUtils';

interface SwissLeagueExecutionViewProps {
  phase: SwissLeaguePhase;
  teams: Country[]; // Drawn/seeded teams array from SwissLeagueDrawView
  onComplete: (summary: {
    standings: Country[];
    playoffs?: Country[];
  }) => void;
}

export function SwissLeagueExecutionView({
  phase,
  teams,
  onComplete,
}: SwissLeagueExecutionViewProps): JSX.Element {
  const matchesPerTeam = phase?.config?.number_of_matches_per_team ?? 8;
  const directAdvanceCount = phase?.config?.direct_advance_count ?? 8;
  const playoffStartPosition = phase?.config?.playoff_position_start ?? 9;
  const playoffTeamsCount = phase?.config?.playoff_teams_count ?? 16;
  const matchImportance = phase?.config?.match_importance ?? 35; // UCL level importance

  const [localTeams, setLocalTeams] = useState<Country[]>(() => teams);

  useEffect(() => {
    setLocalTeams(teams);
  }, [teams]);

  const [fixtures, setFixtures] = useState<SwissFixture[]>(() =>
    SwissSimulationUtils.generateInitialFixtures(localTeams, matchesPerTeam)
  );

  const standings = useMemo(
    () => SwissSimulationUtils.computeStandings(localTeams, fixtures),
    [localTeams, fixtures]
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

      setLocalTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === nextMatch.homeTeam!.id) {
            return { ...team, form: appendForm(homeChar, team.form) };
          }
          if (team.id === nextMatch.awayTeam!.id) {
            return { ...team, form: appendForm(awayChar, team.form) };
          }
          return team;
        })
      );

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
        const score = GroupMatchSimulationEngine.simulateMatch(f.homeTeam, f.awayTeam);
        return { ...f, homeScore: score.home, awayScore: score.away, isPlayed: true };
      })
    );
  };

  const handleReset = () => {
    setLocalTeams(teams);
    setFixtures(SwissSimulationUtils.generateInitialFixtures(teams, matchesPerTeam));
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
    const finalStandingsTeams = standings.map((r) => r.team);
    const playoffTeams = playoffTeamsCount > 0
      ? standings.slice(playoffStartPosition - 1, playoffStartPosition - 1 + playoffTeamsCount).map((r) => r.team)
      : undefined;

    onComplete({
      standings: finalStandingsTeams,
      playoffs: playoffTeams,
    });
  };

  return (
    <div className="w-full max-w-[150rem] mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Simulation Control Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Swiss League Phase Simulation</h3>
          <p className="text-xs text-gray-500 mt-1">
            Played: <strong className="text-blue-600">{playedMatches}</strong> / {totalMatches} Matches ({matchesPerTeam} Matches / Team)
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

      {/* Main Grid: Unified Standings Table (9 cols) + Fixtures (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Unified Swiss Standings Table */}
        <div className="lg:col-span-9 space-y-4">
          <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Overall League Standings</h4>
          
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 text-gray-600 uppercase">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-2 text-center">P</th>
                    <th className="py-3 px-2 text-center">W</th>
                    <th className="py-3 px-2 text-center">D</th>
                    <th className="py-3 px-2 text-center">L</th>
                    <th className="py-3 px-2 text-center">GF</th>
                    <th className="py-3 px-2 text-center">GA</th>
                    <th className="py-3 px-2 text-center">GD</th>
                    <th className="py-3 px-3 text-center font-bold">Pts</th>
                    <th className="py-3 px-4 text-center">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {standings.map((row) => {
                    const isDirectAdvance = row.rank <= directAdvanceCount;
                    const isPlayoff = row.rank >= playoffStartPosition && row.rank < playoffStartPosition + playoffTeamsCount;

                    return (
                      <tr 
                        key={row.team.id} 
                        className={`hover:bg-gray-50/80 transition-colors ${
                          isDirectAdvance ? 'bg-emerald-50/40' : isPlayoff ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 text-center font-bold text-gray-700">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            isDirectAdvance ? 'bg-emerald-100 text-emerald-800 font-extrabold' : 
                            isPlayoff ? 'bg-blue-100 text-blue-800 font-extrabold' : 'text-gray-600'
                          }`}>
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-gray-900 flex items-center gap-2">
                          {row.team.flag_url && (
                            <img src={row.team.flag_url} alt="" className="w-5 h-3.5 object-cover rounded shadow-xs" />
                          )}
                          <span>{row.team.name}</span>
                          {row.team.isStarred && <span title="Starred Country">⭐</span>}
                        </td>
                        <td className="py-2.5 px-2 text-center text-gray-600">{row.played}</td>
                        <td className="py-2.5 px-2 text-center text-gray-600">{row.won}</td>
                        <td className="py-2.5 px-2 text-center text-gray-600">{row.drawn}</td>
                        <td className="py-2.5 px-2 text-center text-gray-600">{row.lost}</td>
                        <td className="py-2.5 px-2 text-center text-gray-600">{row.goalsFor}</td>
                        <td className="py-2.5 px-2 text-center text-gray-600">{row.goalsAgainst}</td>
                        <td className="py-2.5 px-2 text-center font-medium text-gray-700">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-gray-900 text-sm">{row.points}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="font-mono tracking-wider font-bold text-[11px] text-gray-500">
                            {row.team.form ?? ''}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Match Fixtures List */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Swiss Fixtures</h4>
          <div className="space-y-2.5 max-h-[850px] overflow-y-auto pr-1">
            {fixtures.map((f) => (
              <FixtureItem
                key={f.id}
                fixture={{
                  ...f,
                  groupKey: 'Swiss',
                  round: (f.roundIndex ?? 0) + 1,
                  leg: 1,
                }}
                onScoreChange={handleScoreChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}