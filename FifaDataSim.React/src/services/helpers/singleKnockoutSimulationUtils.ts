import type { Country } from '../../types/country';
import type { SingleKnockoutPhase } from '../../types/tournamentConfig';

export interface KnockoutMatch {
  id: string;
  roundName: string;
  roundIndex: number;
  matchIndex: number;
  teamA: Country | null;
  teamB: Country | null;
  leg1ScoreA: number | null;
  leg1ScoreB: number | null;
  leg2ScoreA: number | null;
  leg2ScoreB: number | null;
  penaltiesA: number | null;
  penaltiesB: number | null;
  winner: Country | null;
  loser: Country | null;
  isPlayed: boolean;
  isThirdPlaceMatch?: boolean;
}

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
  ): KnockoutMatch[] {
    const matches: KnockoutMatch[] = [];
    let currentMatchCount = initialMatchups.length;
    let roundIndex = 0;

    // First Round Matches
    initialMatchups.forEach((m, idx) => {
      matches.push({
        id: `R0-M${idx}`,
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
        matches.push({
          id: `R${roundIndex}-M${i}`,
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
      matches.push({
        id: 'R-THIRD-PLACE',
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

  /**
   * Simulates scores for a match, handling aggregate legs and penalties if tied.
   */
  static simulateMatch(match: KnockoutMatch, legs: number): KnockoutMatch {
    if (!match.teamA || !match.teamB) return match;

    const weights = [0, 0, 1, 1, 2, 2, 3];
    const getRandomScore = () => weights[Math.floor(Math.random() * weights.length)];

    const l1A = getRandomScore();
    const l1B = getRandomScore();

    let l2A: number | null = null;
    let l2B: number | null = null;
    let penA: number | null = null;
    let penB: number | null = null;

    let aggA = l1A;
    let aggB = l1B;

    if (legs === 2) {
      l2A = getRandomScore();
      l2B = getRandomScore();
      aggA += l2A;
      aggB += l2B;
    }

    let winner: Country;
    let loser: Country;

    if (aggA > aggB) {
      winner = match.teamA;
      loser = match.teamB;
    } else if (aggB > aggA) {
      winner = match.teamB;
      loser = match.teamA;
    } else {
      // Penalty Shootout tiebreaker
      penA = 4 + Math.floor(Math.random() * 2);
      penB = penA === 5 ? 4 : 5; // Ensure non-draw in penalties
      if (penA > penB) {
        winner = match.teamA;
        loser = match.teamB;
      } else {
        winner = match.teamB;
        loser = match.teamA;
      }
    }

    return {
      ...match,
      leg1ScoreA: l1A,
      leg1ScoreB: l1B,
      leg2ScoreA: l2A,
      leg2ScoreB: l2B,
      penaltiesA: penA,
      penaltiesB: penB,
      winner,
      loser,
      isPlayed: true,
    };
  }

  /**
   * Recalculates team placements in subsequent rounds based on played matches.
   */
  static propagateWinners(matches: KnockoutMatch[]): KnockoutMatch[] {
    const updated = matches.map((m) => ({ ...m }));
    const maxRound = Math.max(...updated.filter((m) => !m.isThirdPlaceMatch).map((m) => m.roundIndex));

    for (let r = 0; r < maxRound; r++) {
      const currentRoundMatches = updated.filter((m) => m.roundIndex === r && !m.isThirdPlaceMatch);

      currentRoundMatches.forEach((match) => {
        if (!match.isPlayed || !match.winner) return;

        // Feed into next round match
        const nextRoundMatchIndex = Math.floor(match.matchIndex / 2);
        const nextMatch = updated.find(
          (m) => m.roundIndex === r + 1 && m.matchIndex === nextRoundMatchIndex && !m.isThirdPlaceMatch
        );

        if (nextMatch) {
          if (match.matchIndex % 2 === 0) {
            nextMatch.teamA = match.winner;
          } else {
            nextMatch.teamB = match.winner;
          }
        }

        // Feed losers of Semi-Finals into 3rd Place Match
        if (currentRoundMatches.length === 2 && match.loser) {
          const thirdPlaceMatch = updated.find((m) => m.isThirdPlaceMatch);
          if (thirdPlaceMatch) {
            if (match.matchIndex === 0) {
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