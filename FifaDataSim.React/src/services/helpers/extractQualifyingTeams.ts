import type { Country } from "../../types/country";
import type { Phase } from "../../types/tournamentConfig";
import type { PhaseCompletionData } from "./qualificationUtils";

export function extractQualifyingTeams(
  completedData: PhaseCompletionData,
  nextPhase: Phase
): Country[] {
  const targetCount = nextPhase.config.number_of_teams || nextPhase.teams.length;
  const groupStandings = completedData.groupStandings ?? {};
  const groupKeys = Object.keys(groupStandings).sort();

  if (groupKeys.length === 0) return [];

  const qualified: Country[] = [];
  const automaticPerGroup = nextPhase.config.qualifiers_per_group ?? 2;

  // 1. Sort each group internally using Head-to-Head + Disciplinary rules (isSameGroup = true)
  const sortedGroups: Record<string, GroupStandingEntry[]> = {};
  for (const key of groupKeys) {
    sortedGroups[key] = [...groupStandings[key]].sort((a, b) =>
      compareGroupEntries(a, b, true)
    );
  }

  // 2. Extract automatic qualifiers position-by-position
  for (let pos = 0; pos < automaticPerGroup; pos++) {
    for (const key of groupKeys) {
      const entry = sortedGroups[key]?.[pos];
      if (entry) {
        qualified.push(entry.team);
      }
    }
  }

  // 3. Extract Best Wildcard Teams across groups (isSameGroup = false)
  if (qualified.length < targetCount) {
    const qualifiedIds = new Set(qualified.map((c) => c.id));
    const wildcardPool: GroupStandingEntry[] = [];

    for (const key of groupKeys) {
      const remainingInGroup = sortedGroups[key].filter(
        (entry) => !qualifiedIds.has(entry.team.id)
      );
      wildcardPool.push(...remainingInGroup);
    }

    // Rank wildcard candidates across different groups (Disciplinary & Overall stats apply)
    wildcardPool.sort((a, b) => compareGroupEntries(a, b, false));

    const needed = targetCount - qualified.length;
    const wildcards = wildcardPool.slice(0, needed).map((entry) => entry.team);
    qualified.push(...wildcards);
  }

  return qualified.slice(0, targetCount);
}