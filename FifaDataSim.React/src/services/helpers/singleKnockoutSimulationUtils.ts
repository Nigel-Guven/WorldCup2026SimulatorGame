import type { Country } from "../../types/country";
import type { KnockoutMatchup } from "../../types/knockoutMatchup";
import type { SingleKnockoutPhase } from "../../types/tournamentConfiguration";

export class SingleKnockoutSimulationUtils {
  /**
   * Names round stages dynamically based on remaining matches in that round.
   */
  static getRoundName(matchesInRound: number, isThirdPlace = false): string {
    if (isThirdPlace) return 'Third Place Match';
    if (matchesInRound === 1) return 'Final';
    if (matchesInRound === 2) return 'Semi-Finals';
    if (matchesInRound === 4) return 'Quarter-Finals';
    if (matchesInRound === 8) return 'Round of 16';
    if (matchesInRound === 16) return 'Round of 32';
    return `Round of ${matchesInRound * 2}`;
  }

  /**
   * Initializes the complete bracket structure based on initial matchups.
   */
  static createInitialBracket(
    initialMatchups: { matchId: number; teamA: Country; teamB: Country }[],
    phaseConfig: SingleKnockoutPhase['config']
  ): KnockoutMatchup[] {
    const matches: KnockoutMatchup[] = [];
    let currentMatchCount = initialMatchups.length;
    let roundIndex = 0;

    // First Round Matches
    initialMatchups.forEach((m, idx) => {
      const id = `R0-M${idx}`;
      matches.push({
        id,
        matchId: id,
        roundName: this.getRoundName(currentMatchCount),
        roundIndex: 0,
        matchIndex: idx,
        teamA: m.teamA,
        teamB: m.teamB,
        leg1ScoreA: null,
        leg1ScoreB: null,
        leg2ScoreA: null,
        leg2ScoreB: null,
        penaltiesA: null,
        penaltiesB: null,
        winner: null,
        loser: null,
        isPlayed: false,
      });
    });

    // Generate downstream placeholder rounds (Quarter-Finals, Semi-Finals, Final)
    while (currentMatchCount > 1) {
      currentMatchCount = currentMatchCount / 2;
      roundIndex++;

      for (let i = 0; i < currentMatchCount; i++) {
        const id = `R${roundIndex}-M${i}`;
        matches.push({
          id,
          matchId: id,
          roundName: this.getRoundName(currentMatchCount),
          roundIndex,
          matchIndex: i,
          teamA: null,
          teamB: null,
          leg1ScoreA: null,
          leg1ScoreB: null,
          leg2ScoreA: null,
          leg2ScoreB: null,
          penaltiesA: null,
          penaltiesB: null,
          winner: null,
          loser: null,
          isPlayed: false,
        });
      }
    }

    // Append 3rd Place Match if configured
    const hasThirdPlace =
      phaseConfig.third_place_match ||
      (phaseConfig as unknown as { third_place_match?: boolean }).third_place_match;

    if (hasThirdPlace && initialMatchups.length >= 2) {
      const id = 'R-THIRD-PLACE';
      matches.push({
        id,
        matchId: id,
        roundName: 'Third Place Match',
        roundIndex: roundIndex, // Same visual level as Final
        matchIndex: 99,
        teamA: null,
        teamB: null,
        leg1ScoreA: null,
        leg1ScoreB: null,
        leg2ScoreA: null,
        leg2ScoreB: null,
        penaltiesA: null,
        penaltiesB: null,
        winner: null,
        loser: null,
        isPlayed: false,
        isThirdPlaceMatch: true,
      });
    }

    return matches;
  }

  static propagateWinners(matches: KnockoutMatchup[]): KnockoutMatchup[] {
    const updated = matches.map((m) => ({ ...m }));
    const maxRound = Math.max(...updated.filter((m) => !m.isThirdPlaceMatch).map((m) => m.roundIndex));

    for (let r = 0; r < maxRound; r++) {
      const currentRoundMatches = updated.filter((m) => m.roundIndex === r && !m.isThirdPlaceMatch);

      currentRoundMatches.forEach((match) => {
        if (!match.isPlayed || !match.winner) return;

        const currentMatchIdx = match.matchIndex ?? 0;

        // Feed into next round match
        const nextRoundMatchIndex = Math.floor(currentMatchIdx / 2);
        const nextMatch = updated.find(
          (m) => m.roundIndex === r + 1 && m.matchIndex === nextRoundMatchIndex && !m.isThirdPlaceMatch
        );

        if (nextMatch) {
          if (currentMatchIdx % 2 === 0) {
            nextMatch.teamA = match.winner;
          } else {
            nextMatch.teamB = match.winner;
          }
        }

        // Feed losers of Semi-Finals into 3rd Place Match
        if (currentRoundMatches.length === 2 && match.loser) {
          const thirdPlaceMatch = updated.find((m) => m.isThirdPlaceMatch);
          if (thirdPlaceMatch) {
            if (currentMatchIdx === 0) {
              thirdPlaceMatch.teamA = match.loser;
            } else {
              thirdPlaceMatch.teamB = match.loser;
            }
          }
        }
      });
    }

    return updated;
  }
}