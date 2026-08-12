import type { Country } from "../../types/country";
import type { KnockoutMatchup } from "../../types/knockoutMatchup";

export function pairCountriesIntoMatchups(
  teams: Country[], 
  pathKey?: string
): KnockoutMatchup[] {
  const matchups: KnockoutMatchup[] = [];

  for (let i = 0; i < teams.length; i += 2) {
    const matchIndex = Math.floor(i / 2) + 1;
    const matchId = pathKey 
      ? `${pathKey}-M${matchIndex}` 
      : `${matchIndex}`;

    matchups.push({
      id: matchId,
      matchId,
      roundIndex: 0,
      isPlayed: false,
      teamA: teams[i] ?? null,
      teamB: teams[i + 1] ?? null,
      winner: null,
    });
  }

  return matchups;
}

export function transformPathAssignmentsToMatchups(
  pathAssignments: Record<string, Country[]>
): Record<string, KnockoutMatchup[]> {
  const result: Record<string, KnockoutMatchup[]> = {};

  for (const [pathKey, teams] of Object.entries(pathAssignments)) {
    result[pathKey] = pairCountriesIntoMatchups(teams, pathKey);
  }

  return result;
}