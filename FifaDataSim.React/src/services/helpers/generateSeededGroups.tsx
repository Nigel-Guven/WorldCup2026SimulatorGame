import type { Country } from "../../types/country";

export function generateAutoGroupsByRanking(
  teams: Country[],
  groupCount: number = 4
): Record<string, Country[]> {
  if (!teams || teams.length === 0) return {};

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

    const groupIndex =
      round % 2 === 0 ? positionInRound : groupCount - 1 - positionInRound;

    groups[groupKeys[groupIndex]].push(team);
  });

  return groups;
}