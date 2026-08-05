import type { Country } from '../../types/country';
import type { MultiKnockoutPhase } from '../../types/tournamentConfig';
import {
  SingleKnockoutSimulationUtils,
  type KnockoutMatch,
} from './singleKnockoutSimulationUtils';

export interface PathState {
  pathKey: string;
  matches: KnockoutMatch[];
  isComplete: boolean;
  champion: Country | null;
  runnerUp: Country | null;
  thirdPlace?: Country | null;
}

export class MultiKnockoutSimulationUtils {
  /**
   * Initializes initial bracket matches for every path key.
   */
  static initializeMultiBracket(
    pathAssignments: Record<string, { matchId: number; teamA: Country; teamB: Country }[]>,
    phaseConfig: MultiKnockoutPhase['config']
  ): Record<string, PathState> {
    const states: Record<string, PathState> = {};

    Object.entries(pathAssignments).forEach(([pathKey, initialMatchups]) => {
        const matches = SingleKnockoutSimulationUtils.createInitialBracket(
            initialMatchups,
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