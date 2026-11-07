import { useMemo, useCallback, type JSX } from 'react';
import type { SwissLeaguePhase } from '../../../../types/tournamentConfiguration';
import type { Country } from '../../../../types/country';
import { DrawUtils } from '../../../../services/helpers/drawUtils';
import { useDrawAssignment } from '../../../../hooks/useDrawAssignment';
import type { Pot } from '../../../../types/pot';
import { getTeamKey } from '../draws/GroupStageDrawView';
import { DrawHeader } from '../draws/DrawHeader';
import { PotSidebar } from '../draws/PotSidebar';

interface SwissLeagueDrawViewProps {
  phase: SwissLeaguePhase;
  pots: Pot[];
  onComplete: (teams: Country[]) => void;
}

export interface SwissMatchFixture {
  opponent: Country;
  venue: 'H' | 'A';
}

export function SwissLeagueDrawView({
  phase,
  pots = [],
  onComplete,
}: SwissLeagueDrawViewProps): JSX.Element {
  const matchesPerTeam = phase?.config?.number_of_matches_per_team || 8;
  const targetHomeMatches = Math.floor(matchesPerTeam / 2);

  // 1. Sort pots and teams by default_points descending
  const sortedPots = useMemo(() => {
    return pots.map((pot, potIdx) => ({
      ...pot,
      id: pot.id ?? `pot-${potIdx + 1}`,
      name: pot.name ?? `Pot ${potIdx + 1}`,
      teams: [...(pot.teams || [])].sort(
        (a, b) => (b.default_points ?? 0) - (a.default_points ?? 0)
      ),
    }));
  }, [pots]);

  const allEnrolledTeams = useMemo(() => {
    return sortedPots.flatMap((p) => p.teams);
  }, [sortedPots]);

  const totalSlots = allEnrolledTeams.length;

  const getTeamPotName = useCallback(
    (opponent: Country): string => {
      const oppKey = getTeamKey(opponent);
      for (const pot of sortedPots) {
        if (pot.teams.some((t) => getTeamKey(t) === oppKey)) {
          return pot.name;
        }
      }
      return '';
    },
    [sortedPots]
  );

  // 2. Pre-calculate Master Symmetrical Match Matrix with 50/50 Home/Away Balancing
  const masterPairingsMap = useMemo(() => {
    const pairingsMap: Record<string, SwissMatchFixture[]> = {};
    allEnrolledTeams.forEach((t) => {
      const key = getTeamKey(t);
      if (key !== undefined) pairingsMap[String(key)] = [];
    });

    const potCount = sortedPots.length || 1;
    const targetPerPot = Math.floor(matchesPerTeam / potCount);
    const remainder = matchesPerTeam % potCount;

    const teamKeys = allEnrolledTeams.map((t) => getTeamKey(t));
    const matchMap = new Map<string | number, Set<string | number>>();
    teamKeys.forEach((key) => {
      if (key !== undefined) matchMap.set(key, new Set());
    });

    // Pass 1: Strict Pot-Balanced Quota Matching
    sortedPots.forEach((targetPot, potIdx) => {
      const requiredFromPot = targetPerPot + (potIdx < remainder ? 1 : 0);
      if (requiredFromPot <= 0) return;

      allEnrolledTeams.forEach((homeTeam) => {
        const homeKey = getTeamKey(homeTeam);
        if (homeKey === undefined) return;

        const homeOpponents = matchMap.get(homeKey)!;
        const currentFromPot = Array.from(homeOpponents).filter((oppKey) =>
          targetPot.teams.some((t) => getTeamKey(t) === oppKey)
        ).length;

        let needed = requiredFromPot - currentFromPot;

        if (needed > 0) {
          const candidates = DrawUtils.shuffle(
            targetPot.teams.filter((candidate) => {
              const candKey = getTeamKey(candidate);
              if (candKey === undefined || candKey === homeKey) return false;
              if (homeOpponents.has(candKey)) return false;

              const candOpponents = matchMap.get(candKey)!;
              if (candOpponents.size >= matchesPerTeam) return false;

              const homePotIdx = sortedPots.findIndex((p) =>
                p.teams.some((t) => getTeamKey(t) === homeKey)
              );
              const candReqFromHomePot =
                targetPerPot + (homePotIdx < remainder ? 1 : 0);
              const candCurrentFromHomePot = Array.from(candOpponents).filter(
                (oppKey) =>
                  sortedPots[homePotIdx]?.teams.some(
                    (t) => getTeamKey(t) === oppKey
                  )
              ).length;

              return candCurrentFromHomePot < candReqFromHomePot;
            })
          );

          for (let i = 0; i < Math.min(needed, candidates.length); i++) {
            const oppKey = getTeamKey(candidates[i]);
            if (oppKey !== undefined) {
              homeOpponents.add(oppKey);
              matchMap.get(oppKey)?.add(homeKey);
            }
          }
        }
      });
    });

    // Pass 2: Residual Cleanup Pass for any unfulfilled slots
    allEnrolledTeams.forEach((homeTeam) => {
      const homeKey = getTeamKey(homeTeam);
      if (homeKey === undefined) return;

      const homeOpponents = matchMap.get(homeKey)!;
      while (homeOpponents.size < matchesPerTeam) {
        const availableCandidates = DrawUtils.shuffle(
          allEnrolledTeams.filter((candidate) => {
            const candKey = getTeamKey(candidate);
            if (candKey === undefined || candKey === homeKey) return false;
            if (homeOpponents.has(candKey)) return false;
            return (matchMap.get(candKey)?.size ?? 0) < matchesPerTeam;
          })
        );

        if (availableCandidates.length === 0) break;

        const oppKey = getTeamKey(availableCandidates[0]);
        if (oppKey !== undefined) {
          homeOpponents.add(oppKey);
          matchMap.get(oppKey)?.add(homeKey);
        } else {
          break;
        }
      }
    });

    // Pass 3: Strict Quota-Enforced Home/Away Graph Balancer
    const maxHomePerTeam = Math.floor(matchesPerTeam / 2);
    const directedEdges = new Map<string, 'H' | 'A'>();
    const homeCounts = new Map<string | number, number>();
    
    teamKeys.forEach((key) => {
      if (key !== undefined) homeCounts.set(key, 0);
    });

    // Deduplicate paired edges
    const uniquePairs: [string | number, string | number][] = [];
    const processedPairs = new Set<string>();

    teamKeys.forEach((keyA) => {
      if (keyA === undefined) return;
      const opps = matchMap.get(keyA) || new Set();
      opps.forEach((keyB) => {
        const pairKey = [keyA, keyB].sort().join('::');
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          uniquePairs.push([keyA, keyB]);
        }
      });
    });

    const shuffledPairs = DrawUtils.shuffle([...uniquePairs]);

    // Initial Pass: Respect strict maxHomePerTeam cap
    shuffledPairs.forEach(([teamAKey, teamBKey]) => {
      const homeA = homeCounts.get(teamAKey) ?? 0;
      const homeB = homeCounts.get(teamBKey) ?? 0;

      let assignAAsHome = false;

      if (homeA < maxHomePerTeam && homeB >= maxHomePerTeam) {
        assignAAsHome = true;
      } else if (homeB < maxHomePerTeam && homeA >= maxHomePerTeam) {
        assignAAsHome = false;
      } else {
        assignAAsHome = homeA <= homeB;
      }

      if (assignAAsHome) {
        directedEdges.set(`${teamAKey}-${teamBKey}`, 'H');
        directedEdges.set(`${teamBKey}-${teamAKey}`, 'A');
        homeCounts.set(teamAKey, homeA + 1);
      } else {
        directedEdges.set(`${teamAKey}-${teamBKey}`, 'A');
        directedEdges.set(`${teamBKey}-${teamAKey}`, 'H');
        homeCounts.set(teamBKey, homeB + 1);
      }
    });

    // Swap Pass: Fix leftover imbalances by iteratively swapping edge directions
    let swapped = true;
    let passes = 0;
    while (swapped && passes < 50) {
      swapped = false;
      passes++;

      for (const [teamAKey, teamBKey] of uniquePairs) {
        const homeA = homeCounts.get(teamAKey) ?? 0;
        const homeB = homeCounts.get(teamBKey) ?? 0;
        const edgeA = directedEdges.get(`${teamAKey}-${teamBKey}`);

        if (edgeA === 'H' && homeA > maxHomePerTeam && homeB < maxHomePerTeam) {
          directedEdges.set(`${teamAKey}-${teamBKey}`, 'A');
          directedEdges.set(`${teamBKey}-${teamAKey}`, 'H');
          homeCounts.set(teamAKey, homeA - 1);
          homeCounts.set(teamBKey, homeB + 1);
          swapped = true;
        } else if (edgeA === 'A' && homeB > maxHomePerTeam && homeA < maxHomePerTeam) {
          directedEdges.set(`${teamAKey}-${teamBKey}`, 'H');
          directedEdges.set(`${teamBKey}-${teamAKey}`, 'A');
          homeCounts.set(teamAKey, homeA + 1);
          homeCounts.set(teamBKey, homeB - 1);
          swapped = true;
        }
      }
    }

    // Build final output with Home/Away indicators
    const teamLookup = new Map(allEnrolledTeams.map((t) => [getTeamKey(t), t]));
    allEnrolledTeams.forEach((team) => {
      const teamKey = getTeamKey(team);
      if (teamKey === undefined) return;
      const opponentKeys = Array.from(matchMap.get(teamKey) || []);
      
      pairingsMap[String(teamKey)] = opponentKeys
        .map((k) => {
          const oppTeam = teamLookup.get(k);
          if (!oppTeam) return null;
          const venue = directedEdges.get(`${teamKey}-${k}`) || 'H';
          return { opponent: oppTeam, venue };
        })
        .filter((f): f is SwissMatchFixture => f !== null);
    });

    return pairingsMap;
  }, [allEnrolledTeams, sortedPots, matchesPerTeam]);

  const autoDrawAllTeams = useCallback(() => {
    return { SWISS_MAP: masterPairingsMap };
  }, [masterPairingsMap]);

  const {
    drawState,
    setDrawState,
    selectedTeam,
    setSelectedTeam,
    assignedTeamIds,
    isComplete,
    selectTeam,
    handleDrawNextAvailable,
    handleAutoDrawAll,
    handleReset,
    getResult,
  } = useDrawAssignment<Country, Record<string, Record<string, SwissMatchFixture[]>>, Country[]>({
    totalTeams: totalSlots,
    initialState: { SWISS_MAP: {} },

    getAssignedIds: (state) => {
      const map = state['SWISS_MAP'] || {};
      return new Set(Object.keys(map));
    },

    assignSingleTeam: (state, team) => {
      if (!team) return state;
      const currentMap = state['SWISS_MAP'] || {};
      const teamKey = getTeamKey(team);
      if (teamKey === undefined) return state;

      const teamKeyStr = String(teamKey);
      if (currentMap[teamKeyStr]) return state;

      const fixturesForTeam = masterPairingsMap[teamKeyStr] || [];

      return {
        ...state,
        SWISS_MAP: {
          ...currentMap,
          [teamKeyStr]: fixturesForTeam,
        },
      };
    },

    autoDrawAll: autoDrawAllTeams,
    buildResult: (state) => {
      const map = state['SWISS_MAP'] || {};
      return allEnrolledTeams.filter((t) => map[String(getTeamKey(t))] !== undefined);
    },
  });

  const swissMap = drawState['SWISS_MAP'] || {};
  const isFull = Object.keys(swissMap).length >= totalSlots;
  const canDropHere = selectedTeam && !isFull;

  const handleAssignToLeague = () => {
    if (!canDropHere || !selectedTeam) return;
    const teamKey = getTeamKey(selectedTeam);
    if (teamKey === undefined) return;

    const teamKeyStr = String(teamKey);
    if (swissMap[teamKeyStr]) return;

    const fixturesForTeam = masterPairingsMap[teamKeyStr] || [];

    setDrawState((prev) => ({
      ...prev,
      SWISS_MAP: {
        ...(prev['SWISS_MAP'] || {}),
        [teamKeyStr]: fixturesForTeam,
      },
    }));
    setSelectedTeam(null);
  };

  const handleRemoveFromLeague = (team: Country) => {
    const keyToRemove = getTeamKey(team);
    if (keyToRemove === undefined) return;

    const updatedMap = { ...(drawState['SWISS_MAP'] || {}) };
    delete updatedMap[String(keyToRemove)];

    setDrawState((prev) => ({
      ...prev,
      SWISS_MAP: updatedMap,
    }));
  };

  return (
    <div className="space-y-6">
      <DrawHeader
        title="Swiss League Team-by-Team Draw"
        subtitle={`Pre-calculated master pairings (${matchesPerTeam} matches/team, ${targetHomeMatches}H/${matchesPerTeam - targetHomeMatches}A split across pots).`}
        assignedCount={assignedTeamIds.size}
        totalTeams={totalSlots}
        isComplete={isComplete}
        confirmLabel="Lock & Confirm League Roster"
        onDrawNext={() => handleDrawNextAvailable(sortedPots)}
        onAutoDraw={handleAutoDrawAll}
        onReset={handleReset}
        onConfirm={() => onComplete(getResult())}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pot Sidebar */}
        <div className="lg:col-span-3">
          <PotSidebar
            pots={sortedPots}
            assignedTeamIds={assignedTeamIds}
            selectedTeam={selectedTeam}
            onSelectTeam={selectTeam}
          />
        </div>

        {/* Master Matrix Table */}
        <div className="lg:col-span-9">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">
              Swiss League Match Matrix
            </h4>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              {Object.keys(swissMap).length} / {totalSlots} Enrolled
            </span>
          </div>

          <div
            onClick={handleAssignToLeague}
            className={`bg-white border-2 rounded-xl p-4 shadow-sm transition-all overflow-x-auto ${
              canDropHere
                ? 'border-dashed border-amber-400 bg-amber-50/20 cursor-pointer hover:border-amber-500'
                : 'border-gray-200'
            }`}
          >
            {Object.keys(swissMap).length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">
                  No teams drawn yet. Select a team from the sidebar or click auto-draw.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold w-12">#</th>
                    <th className="py-2.5 px-3 font-semibold min-w-[180px]">Team</th>
                    {Array.from({ length: matchesPerTeam }).map((_, i) => (
                      <th key={i} className="py-2.5 px-2 font-semibold text-center min-w-[140px]">
                        Match {i + 1}
                      </th>
                    ))}
                    <th className="py-2.5 px-2 font-semibold w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {allEnrolledTeams.map((team, idx) => {
                    const teamKey = getTeamKey(team);
                    if (teamKey === undefined || !swissMap[String(teamKey)]) return null;

                    const fixtures = swissMap[String(teamKey)] || [];
                    const paddedFixtures: (SwissMatchFixture | null)[] = [
                      ...fixtures,
                      ...Array(Math.max(0, matchesPerTeam - fixtures.length)).fill(null),
                    ];

                    const homeCount = fixtures.filter((f) => f.venue === 'H').length;
                    const awayCount = fixtures.filter((f) => f.venue === 'A').length;

                    return (
                      <tr key={teamKey} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 text-xs font-bold text-gray-400">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2.5">
                            {team.flag_url && (
                              <img
                                src={team.flag_url}
                                alt=""
                                className="w-5 h-4 object-cover rounded shadow-2xs"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-800 text-xs">
                                {team.name}
                              </p>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="text-[10px] text-gray-400">
                                  Pts: {team.default_points ?? 0}
                                </span>
                                <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1 rounded">
                                  {homeCount}H / {awayCount}A
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {paddedFixtures.map((fix, matchIdx) => {
                          const potName = fix ? getTeamPotName(fix.opponent) : '';
                          return (
                            <td key={matchIdx} className="py-3 px-2 text-center">
                              {fix ? (
                                <div className="inline-flex flex-col items-center bg-gray-50 border border-gray-200 px-2 py-1 rounded-md w-full shadow-2xs relative">
                                  <div className="flex items-center space-x-1 max-w-[120px]">
                                    <span
                                      className={`text-[9px] font-bold px-1 rounded ${
                                        fix.venue === 'H'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-amber-100 text-amber-700'
                                      }`}
                                    >
                                      {fix.venue}
                                    </span>
                                    <span className="text-xs font-medium text-gray-800 truncate">
                                      {fix.opponent.name}
                                    </span>
                                  </div>
                                  {potName && (
                                    <span className="text-[9px] bg-gray-200/70 text-gray-600 px-1.5 py-0.2 rounded mt-0.5">
                                      {potName}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300 italic border border-dashed border-gray-200 px-2 py-1.5 rounded block">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}

                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromLeague(team);
                            }}
                            className="text-gray-400 hover:text-red-600 p-1 text-xs font-medium transition-colors"
                            title="Remove team"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}