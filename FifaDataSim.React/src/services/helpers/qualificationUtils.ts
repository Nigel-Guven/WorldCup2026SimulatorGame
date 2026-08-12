import type { Country } from "../../types/country";
import type { Phase } from "../../types/phase";
import type { PhaseCompletionData } from "../../types/phaseCompletionData";
import { PhaseType } from "../../types/phaseType";

export function extractAdvancingTeams(
  phase: Phase,
  completionData: PhaseCompletionData
): Country[] {
  const advancingTeams: Country[] = [];

  switch (phase.type) {
    case PhaseType.GroupStage: {
      if (!completionData.groupStandings) return [];

      const teamsPerGroupToAdvance = phase.config.direct_advance_per_group ?? 2;
      const sortedGroupKeys = Object.keys(completionData.groupStandings).sort();

      for (let rank = 0; rank < teamsPerGroupToAdvance; rank++) {
        for (const groupKey of sortedGroupKeys) {
          const groupList = completionData.groupStandings[groupKey];
          // Access .country on the GroupStandingEntry object
          if (groupList && groupList[rank]?.team) {
            advancingTeams.push(groupList[rank].team);
          }
        }
      }
      break;
    }

    case PhaseType.SingleBranchKnockoutStage: {
      if (!completionData.knockoutWinners) return [];
      advancingTeams.push(...completionData.knockoutWinners);
      break;
    }

    case PhaseType.MultiBranchKnockoutStage: {
      if (!completionData.pathWinners) return [];
      const sortedPathKeys = Object.keys(completionData.pathWinners).sort();
      for (const pathKey of sortedPathKeys) {
        const summary = completionData.pathWinners[pathKey];
        if (summary) {
          // Extract non-null Country objects into an array
          const teamsInPath: Country[] = [
            summary.champion,
            summary.runnerUp,
            ...(summary.thirdPlace ? [summary.thirdPlace] : []),
          ];
          advancingTeams.push(...teamsInPath);
        }
      }
      break;
    }

    default:
      break;
  }

  return advancingTeams;
}