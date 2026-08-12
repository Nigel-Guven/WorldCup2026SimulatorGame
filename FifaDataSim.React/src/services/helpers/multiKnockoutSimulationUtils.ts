import type { Country } from '../../types/country';
import type { KnockoutMatchup } from '../../types/knockoutMatchup';
import type { PathState } from '../../types/multiKnockoutPathState';
import type { MultiKnockoutPhase } from '../../types/tournamentConfiguration';
import {
  SingleKnockoutSimulationUtils,
} from './singleKnockoutSimulationUtils';



export class MultiKnockoutSimulationUtils {

  static initializeMultiBracket(
    pathAssignments: Record<string, KnockoutMatchup[]>,
    phaseConfig: MultiKnockoutPhase['config']
  ): Record<string, PathState> {
    const states: Record<string, PathState> = {};

    Object.entries(pathAssignments).forEach(([pathKey, initialMatchups]) => {
        // 1. Map string match IDs to numbers to satisfy SingleKnockoutSimulationUtils
        const formattedMatchups = initialMatchups.map((match) => ({
            // Fallback to match.id if matchId isn't on the object, and parse to number
            matchId: Number(match.matchId || match.id) || 0,
            // Cast to ensure it satisfies the strict Country requirement if teamA/B are nullable
            teamA: match.teamA as Country, 
            teamB: match.teamB as Country
        }));

        // 2. Pass the mapped array
        const matches = SingleKnockoutSimulationUtils.createInitialBracket(
            formattedMatchups,
            {
              ...phaseConfig,
              third_place_match: phaseConfig.third_place_match ?? false,
            }
        );

        states[pathKey] = {
            pathKey,
            matches,
            isComplete: false,
            champion: null,
            runnerUp: null,
            thirdPlace: null,
        };
    });

    return states;
  }

  /**
   * Evaluates completion status and determines winners for a given path.
   */
  static updatePathCompletion(pathState: PathState): PathState {
    const finalMatch = pathState.matches.find((m) => m.roundName === 'Final');
    const thirdPlaceMatch = pathState.matches.find((m) => m.isThirdPlaceMatch);

    const isComplete = Boolean(
      finalMatch?.isPlayed && (!thirdPlaceMatch || thirdPlaceMatch.isPlayed)
    );

    return {
      ...pathState,
      isComplete,
      champion: finalMatch?.winner || null,
      runnerUp: finalMatch?.loser || null,
      thirdPlace: thirdPlaceMatch?.winner || null,
    };
  }
}