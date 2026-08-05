import { useState, useMemo, type JSX } from 'react';
import type { Country } from '../../types/country';
import { GroupSimulationUtils, type Fixture } from '../../services/helpers/groupSimulationUtils';
import type { GroupStagePhase } from '../../types/tournamentConfig';

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
  const legs = phase.config.number_of_legs || 1;
  const directAdvanceCount = phase.config.direct_advance_per_group || 2;
  const wildcardIndex = phase.config.wildcard_position || 0;
  const wildcardCount = phase.config.wildcard_teams_count || 0;

  // Initialize Fixtures once
  const [fixtures, setFixtures] = useState<Fixture[]>(() =>
    GroupSimulationUtils.generateGroupFixtures(groups, legs)
  );

  // Compute live group standings
  const standings = useMemo(
    () => GroupSimulationUtils.computeGroupStandings(groups, fixtures),
    [groups, fixtures]
  );

  // Compute live wildcard standings table
  const wildcardStandings = useMemo(
    () => GroupSimulationUtils.computeWildcardStandings(standings, wildcardIndex),
    [standings, wildcardIndex]
  );

  const totalMatches = fixtures.filter((f) => f.homeTeam && f.awayTeam).length;
  const playedMatches = fixtures.filter(
    (f) => f.isPlayed && f.homeTeam && f.awayTeam
  ).length;
  const isPhaseComplete = playedMatches === totalMatches;

  // Simulate next single unplayed match
  const handleSimulateNext = () => {
    const nextMatch = fixtures.find((f) => !f.isPlayed && f.homeTeam && f.awayTeam);
    if (!nextMatch) return;

    const score = GroupSimulationUtils.simulateRandomScore();
    setFixtures((prev) =>
      prev.map((f) =>
        f.id === nextMatch.id
          ? { ...f, homeScore: score.home, awayScore: score.away, isPlayed: true }
          : f
      )
    );
  };

  // Simulate all remaining unplayed matches at once
  const handleSimulateAll = () => {
    setFixtures((prev) =>
      prev.map((f) => {
        if (f.isPlayed || !f.homeTeam || !f.awayTeam) return f;
        const score = GroupSimulationUtils.simulateRandomScore();
        return { ...f, homeScore: score.home, awayScore: score.away, isPlayed: true };
      })
    );
  };

  const handleReset = () => {
    setFixtures(GroupSimulationUtils.generateGroupFixtures(groups, legs));
  };

  const handleScoreChange = (fixtureId: string, side: 'home' | 'away', value: string) => {
    const numVal = value === '' ? null : Math.max(0, parseInt(value, 10) || 0);
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

    const wildcards = wildcardStandings
      .slice(0, wildcardCount)
      .map((r) => r.team);

    onComplete({ standings: finalStandings, wildcards });
  };

  return (
    <div className="space-y-8">
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
          <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">
            Group Tables
          </h4>

          <div className="grid grid-cols-1 gap-6">
            {Object.entries(standings).map(([groupKey, rows]) => (
              <div key={groupKey} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                  <h5 className="font-bold text-gray-800 text-sm">Group {groupKey}</h5>
                  <span className="text-[11px] text-gray-400">
                    Top {directAdvanceCount} Direct Advance
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                        <th className="py-2 px-1 w-6">#</th>
                        <th className="py-2 px-2">Team</th>
                        <th className="py-2 px-1 text-center">P</th>
                        <th className="py-2 px-1 text-center">W</th>
                        <th className="py-2 px-1 text-center">D</th>
                        <th className="py-2 px-1 text-center">L</th>
                        <th className="py-2 px-1 text-center">GD</th>
                        <th className="py-2 px-1 text-center font-bold text-gray-700">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => {
                        const rank = idx + 1;
                        const isDirect = rank <= directAdvanceCount;
                        const isWildcardCandidate = wildcardIndex > 0 && rank === wildcardIndex;

                        let rowStyle = 'hover:bg-gray-50/50';
                        if (isDirect) rowStyle = 'bg-emerald-50/60 text-emerald-950 font-medium';
                        else if (isWildcardCandidate) rowStyle = 'bg-amber-50/60 text-amber-950 font-medium';

                        return (
                          <tr key={row.team.id} className={`border-b border-gray-100/60 ${rowStyle}`}>
                            <td className="py-2 px-1 font-bold text-[11px]">{rank}</td>
                            <td className="py-2 px-2 font-medium">{row.team.name}</td>
                            <td className="py-2 px-1 text-center text-gray-500">{row.played}</td>
                            <td className="py-2 px-1 text-center text-gray-500">{row.won}</td>
                            <td className="py-2 px-1 text-center text-gray-500">{row.drawn}</td>
                            <td className="py-2 px-1 text-center text-gray-500">{row.lost}</td>
                            <td className="py-2 px-1 text-center text-gray-500">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                            <td className="py-2 px-1 text-center font-bold text-gray-900">{row.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Optional Wildcard Table */}
          {wildcardIndex > 0 && (
            <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-purple-100 pb-2 mb-3">
                <h5 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                  ⭐ Wildcard Ranking Table (Position #{wildcardIndex} across groups)
                </h5>
                <span className="text-[11px] text-purple-600 font-semibold">
                  Top {wildcardCount} Advance
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-purple-100 text-purple-400 font-semibold uppercase text-[10px]">
                      <th className="py-2 px-1 w-6">#</th>
                      <th className="py-2 px-2">Team</th>
                      <th className="py-2 px-1 text-center">Group</th>
                      <th className="py-2 px-1 text-center">P</th>
                      <th className="py-2 px-1 text-center">GD</th>
                      <th className="py-2 px-1 text-center font-bold text-purple-900">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wildcardStandings.map((row, idx) => {
                      const rank = idx + 1;
                      const isWildcardPole = rank <= wildcardCount;

                      return (
                        <tr
                          key={row.team.id}
                          className={`border-b border-purple-50 ${
                            isWildcardPole ? 'bg-purple-100/70 text-purple-950 font-semibold' : 'hover:bg-purple-50/20'
                          }`}
                        >
                          <td className="py-2 px-1 font-bold">{rank}</td>
                          <td className="py-2 px-2">{row.team.name}</td>
                          <td className="py-2 px-1 text-center font-bold text-purple-700">{row.groupKey}</td>
                          <td className="py-2 px-1 text-center text-gray-500">{row.played}</td>
                          <td className="py-2 px-1 text-center text-gray-500">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                          <td className="py-2 px-1 text-center font-bold text-purple-950">{row.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Match Fixtures List */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">
            Match Fixtures
          </h4>

          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
            {fixtures.map((f) => {
              const isBye = !f.homeTeam || !f.awayTeam;

              if (isBye) {
                const activeTeam = f.homeTeam || f.awayTeam;
                return (
                  <div
                    key={f.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-500 flex justify-between items-center"
                  >
                    <span>
                      Group <strong>{f.groupKey}</strong> (R{f.round})
                    </span>
                    <span className="font-medium text-gray-600">
                      <strong>{activeTeam?.name}</strong> HAS A BYE
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={f.id}
                  className={`border rounded-xl p-3 bg-white shadow-sm flex items-center justify-between transition-all ${
                    f.isPlayed ? 'border-gray-200 bg-gray-50/30' : 'border-blue-200 bg-blue-50/10'
                  }`}
                >
                  <div className="flex-1 text-right font-medium text-xs text-gray-800 pr-2 truncate">
                    {f.homeTeam?.name}
                  </div>

                  {/* Editable score inputs */}
                  <div className="flex items-center gap-1.5 px-2">
                    <input
                      type="number"
                      min={0}
                      value={f.homeScore ?? ''}
                      onChange={(e) => handleScoreChange(f.id, 'home', e.target.value)}
                      className="w-8 h-8 text-center border border-gray-300 rounded-lg text-xs font-bold focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-gray-300 font-bold text-xs">-</span>
                    <input
                      type="number"
                      min={0}
                      value={f.awayScore ?? ''}
                      onChange={(e) => handleScoreChange(f.id, 'away', e.target.value)}
                      className="w-8 h-8 text-center border border-gray-300 rounded-lg text-xs font-bold focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex-1 text-left font-medium text-xs text-gray-800 pl-2 truncate">
                    {f.awayTeam?.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}