import type { Country } from "../../types/country";

/**
 * Distributes teams into groups by sorting them by ranking (`default_points`)
 * and assigning one team from each Pot to each Group.
 */
export function generateAutoGroupsByRanking(
  teams: Country[],
  groupCount: number = 4
): Record<string, Country[]> {
  if (!teams || teams.length === 0) return {};

  // 1. Sort teams descending by ranking points
  const sortedTeams = [...teams].sort((a, b) => {
    const pointsA = a.default_points ?? 0;
    const pointsB = b.default_points ?? 0;
    return pointsB - pointsA;
  });

  const numGroups = Math.max(1, groupCount);
  const groupKeys = Array.from({ length: numGroups }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const groups: Record<string, Country[]> = {};
  groupKeys.forEach((key) => (groups[key] = []));

  // 2. Pot-based serpentine distribution across groups (Pot 1 -> Pot 2 -> Pot 3...)
  sortedTeams.forEach((team, index) => {
    const groupIndex = index % numGroups;
    groups[groupKeys[groupIndex]].push(team);
  });

  return groups;
}

export function generateAutoGroupsSerpentine(
  teams: Country[],
  groupCount: number = 2
): Record<string, Country[]> {
  const sortedTeams = [...teams].sort(
    (a, b) => (b.default_points ?? 0) - (a.default_points ?? 0)
  );

  const groupKeys = Array.from({ length: groupCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const groups: Record<string, Country[]> = {};
  groupKeys.forEach((key) => (groups[key] = []));

  sortedTeams.forEach((team, index) => {
    const round = Math.floor(index / groupCount);
    const positionInRound = index % groupCount;

    // Even rounds go A -> B, odd rounds go B -> A
    const groupIndex =
      round % 2 === 0 ? positionInRound : groupCount - 1 - positionInRound;

    groups[groupKeys[groupIndex]].push(team);
  });

  return groups;
}