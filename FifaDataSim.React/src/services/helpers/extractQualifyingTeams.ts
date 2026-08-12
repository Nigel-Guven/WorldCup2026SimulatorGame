import type { Country } from "../../types/country";
import type { GroupStandingEntry } from "../../types/groupStandingEntry";
import type { Phase } from "../../types/phase";
import type { PhaseCompletionData } from "../../types/phaseCompletionData";
import { compareGroupEntries } from "./groupTieBreakerUtils";

export function extractQualifyingTeams(
  completedData: PhaseCompletionData,
  nextPhase: Phase
): Country[] {
  // Ensure numeric types for comparisons and arithmetic
  const targetCount = Number(nextPhase.config.winners_to_phase_tag) || nextPhase.teams.length;
  const automaticPerGroup = nextPhase.config.winners_to_phase_tag ?? 2;
  const numericAutomaticPerGroup = Number(automaticPerGroup) || 0;

  const groupStandings = completedData.groupStandings ?? {};
  const groupKeys = Object.keys(groupStandings).sort();

  if (groupKeys.length === 0) return [];

  const qualified: Country[] = [];

  // 1. Sort each group internally using Head-to-Head + Disciplinary rules (isSameGroup = true)
  const sortedGroups: Record<string, GroupStandingEntry[]> = {};
  for (const key of groupKeys) {
    sortedGroups[key] = [...groupStandings[key]].sort((a, b) =>
      compareGroupEntries(a, b, true)
    );
  }

  // 2. Extract automatic qualifiers position-by-position
  for (let pos = 0; pos < numericAutomaticPerGroup; pos++) {
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