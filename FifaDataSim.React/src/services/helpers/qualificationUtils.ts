import type { Country } from "../../types/country";
import { PhaseType } from "../../types/phaseType";

export interface PhaseCompletionData {
  // Group stage standings mapped by group key (e.g., 'A': [1st, 2nd, 3rd, 4th])
  groupStandings?: Record<string, Country[]>;
  // Single knockout winner sequence (final champion / round winners)
  knockoutWinners?: Country[];
  // Multi-branch knockout winners mapped by path key (e.g., 'Path A': Winner)
  pathWinners?: Record<string, Country>;
}

/**
 * Extracts qualified teams from a completed phase based on its type and configuration.
 */
export function extractAdvancingTeams(
  phase: Phase,
  completionData: PhaseCompletionData
): Country[] {
  const advancingTeams: Country[] = [];

  switch (phase.type) {
    case PhaseType.GroupStage: {
      if (!completionData.groupStandings) return [];

      const teamsPerGroupToAdvance = phase.config.advancing_per_group ?? 2;
      const sortedGroupKeys = Object.keys(completionData.groupStandings).sort();

      // Extract top N teams from each group in order (e.g., 1st from A, 1st from B... then 2nd from A, 2nd from B...)
      for (let rank = 0; rank < teamsPerGroupToAdvance; rank++) {
        for (const groupKey of sortedGroupKeys) {
          const groupList = completionData.groupStandings[groupKey];
          if (groupList && groupList[rank]) {
            advancingTeams.push(groupList[rank]);
          }
        }
      }
      break;
    }

    case PhaseType.SingleBranchKnockoutStage: {
      if (!completionData.knockoutWinners) return [];
      // Pass forward top winner(s) or qualified round survivors
      advancingTeams.push(...completionData.knockoutWinners);
      break;
    }

    case PhaseType.MultiBranchKnockoutStage: {
      if (!completionData.pathWinners) return [];
      const sortedPathKeys = Object.keys(completionData.pathWinners).sort();
      for (const pathKey of sortedPathKeys) {
        if (completionData.pathWinners[pathKey]) {
          advancingTeams.push(completionData.pathWinners[pathKey]);
        }
      }
      break;
    }

    default:
      break;
  }

  return advancingTeams;
}