import type { Country } from "../types/country";
import type { KnockoutMatchup } from "../types/knockoutMatchup";
import { GroupMatchSimulationEngine } from "./groupMatchSimulationService";
import { SimulationEngineService } from "./simulationEngineService";

export class KnockoutSimulationEngine {

  public static simulateKnockoutMatch(
    match: KnockoutMatchup,
    legs: number = 1
  ): KnockoutMatchup {
    if (!match.teamA || !match.teamB) {
      return match;
    }

    // Leg 1: Team A at Home, Team B Away
    const leg1 = GroupMatchSimulationEngine.simulateMatch(
      match.teamA,
      match.teamB
    );

    const l1A = leg1.home;
    const l1B = leg1.away;

    let l2A: number | null = null;
    let l2B: number | null = null;

    if (legs === 2) {
      // Leg 2: Team B at Home, Team A Away
      const leg2 = GroupMatchSimulationEngine.simulateMatch(
        match.teamB,
        match.teamA
      );

      l2B = leg2.home;
      l2A = leg2.away;
    }

    // --- SINGLE LEG RESOLUTION ---
    if (legs === 1) {
      if (l1A > l1B) {
        return {
          ...match,
          leg1ScoreA: l1A,
          leg1ScoreB: l1B,
          leg2ScoreA: null,
          leg2ScoreB: null,
          penaltiesA: null,
          penaltiesB: null,
          winner: match.teamA,
          loser: match.teamB,
          isPlayed: true,
        };
      }

      if (l1B > l1A) {
        return {
          ...match,
          leg1ScoreA: l1A,
          leg1ScoreB: l1B,
          leg2ScoreA: null,
          leg2ScoreB: null,
          penaltiesA: null,
          penaltiesB: null,
          winner: match.teamB,
          loser: match.teamA,
          isPlayed: true,
        };
      }

      // Tie in single leg: Extra Time + Penalties
      const resolution = this.resolveKnockoutTie(
        match.teamA,
        match.teamB,
        l1A,
        l1B
      );

      return {
        ...match,
        leg1ScoreA: resolution.finalHome,
        leg1ScoreB: resolution.finalAway,
        leg2ScoreA: null,
        leg2ScoreB: null,
        penaltiesA: resolution.penA, // e.g. ["R", "G", "G", "G", "R"] or string "RGGGR"
        penaltiesB: resolution.penB, // e.g. ["R", "G", "G", "G", "G"] or string "RGGGG"
        winner: resolution.winner,
        loser: resolution.loser,
        isPlayed: true,
      };
    }

    // --- TWO-LEG RESOLUTION ---
    const aggA = l1A + (l2A ?? 0);
    const aggB = l1B + (l2B ?? 0);

    if (aggA > aggB) {
      return {
        ...match,
        leg1ScoreA: l1A,
        leg1ScoreB: l1B,
        leg2ScoreA: l2A,
        leg2ScoreB: l2B,
        penaltiesA: null,
        penaltiesB: null,
        winner: match.teamA,
        loser: match.teamB,
        isPlayed: true,
      };
    }

    if (aggB > aggA) {
      return {
        ...match,
        leg1ScoreA: l1A,
        leg1ScoreB: l1B,
        leg2ScoreA: l2A,
        leg2ScoreB: l2B,
        penaltiesA: null,
        penaltiesB: null,
        winner: match.teamB,
        loser: match.teamA,
        isPlayed: true,
      };
    }

    // Aggregate is tied: Extra Time + Penalties played in Leg 2 (Team B is Home, Team A is Away)
    const resolution = this.resolveKnockoutTie(
      match.teamB,
      match.teamA,
      l2B ?? 0,
      l2A ?? 0
    );

    return {
      ...match,
      leg1ScoreA: l1A,
      leg1ScoreB: l1B,
      leg2ScoreA: resolution.finalAway, // Team A's leg 2 score including ET
      leg2ScoreB: resolution.finalHome, // Team B's leg 2 score including ET
      penaltiesA: resolution.penB,      // Team A penalties
      penaltiesB: resolution.penA,      // Team B penalties
      winner: resolution.winner,
      loser: resolution.loser,
      isPlayed: true,
    };
  }

  private static resolveKnockoutTie(
    home: Country,
    away: Country,
    homeGoals: number,
    awayGoals: number
  ): {
    winner: Country;
    loser: Country;
    extraTimeHome: number;
    extraTimeAway: number;
    finalHome: number;
    finalAway: number;
    penA: string[] | null;
    penB: string[] | null;
  } {
    let finalHome = homeGoals;
    let finalAway = awayGoals;

    const extraTime = this.simulateExtraTime(home, away);

    finalHome += extraTime.home;
    finalAway += extraTime.away;

    if (finalHome > finalAway) {
      return {
        winner: home,
        loser: away,
        extraTimeHome: extraTime.home,
        extraTimeAway: extraTime.away,
        finalHome,
        finalAway,
        penA: null,
        penB: null,
      };
    }

    if (finalAway > finalHome) {
      return {
        winner: away,
        loser: home,
        extraTimeHome: extraTime.home,
        extraTimeAway: extraTime.away,
        finalHome,
        finalAway,
        penA: null,
        penB: null,
      };
    }

    // Still tied after Extra Time: Shootout
    const penalties = this.simulatePenaltyShootout(home, away);

    return {
      winner: penalties.winner,
      loser: penalties.winner.id === home.id ? away : home,
      extraTimeHome: extraTime.home,
      extraTimeAway: extraTime.away,
      finalHome,
      finalAway,
      penA: penalties.seqA,
      penB: penalties.seqB,
    };
  }

  private static simulateExtraTime(
    home: Country,
    away: Country
  ): { home: number; away: number } {
    const homeQuality = SimulationEngineService.getEffectiveQuality(home);
    const awayQuality = SimulationEngineService.getEffectiveQuality(away);

    const qualityRatio = homeQuality / Math.max(0.1, awayQuality);
    const inverseQualityRatio = awayQuality / Math.max(0.1, homeQuality);

    let homeLambda =
      SimulationEngineService.EXTRA_TIME_HOME_GOALS *
      Math.pow(qualityRatio, 0.15) *
      SimulationEngineService.randomPerformanceFactor();

    let awayLambda =
      SimulationEngineService.EXTRA_TIME_AWAY_GOALS *
      Math.pow(inverseQualityRatio, 0.15) *
      SimulationEngineService.randomPerformanceFactor();

    homeLambda = SimulationEngineService.clamp(homeLambda, 0, 1.5);
    awayLambda = SimulationEngineService.clamp(awayLambda, 0, 1.5);

    return {
      home: SimulationEngineService.knuthPoissonRandom(homeLambda),
      away: SimulationEngineService.knuthPoissonRandom(awayLambda),
    };
  }

  private static getPenaltyProbability(
    team: Country,
    opponent: Country
  ): number {
    const strengthDifference = team.strength - opponent.strength;
    const strengthAdjustment = strengthDifference * 0.0004;

    return SimulationEngineService.clamp(
      SimulationEngineService.PENALTY_CONVERSION_RATE + strengthAdjustment,
      0.68,
      0.82
    );
  }

  private static simulatePenaltyShootout(
    home: Country,
    away: Country
  ): {
    winner: Country;
    seqA: string[]; // Home team kick sequence ['G', 'R', 'G']
    seqB: string[]; // Away team kick sequence ['G', 'G', 'G']
  } {
    const homeProb = this.getPenaltyProbability(home, away);
    const awayProb = this.getPenaltyProbability(away, home);

    const seqA: string[] = [];
    const seqB: string[] = [];

    let scoreA = 0;
    let scoreB = 0;

    // --- PHASE 1: FIRST 5 ROUNDS ---
    for (let round = 1; round <= 5; round++) {
      // Home kick
      const homeScored = Math.random() < homeProb;
      if (homeScored) {
        seqA.push('G');
        scoreA++;
      } else {
        seqA.push('R');
      }

      // Check if Home has mathematically won before Away takes kick in this round
      const remainingB_beforeKick = 5 - (round - 1);
      const remainingA_afterKick = 5 - round;

      if (scoreA > scoreB + remainingB_beforeKick - 1) {
        return { winner: home, seqA, seqB };
      }

      // Away kick
      const awayScored = Math.random() < awayProb;
      if (awayScored) {
        seqB.push('G');
        scoreB++;
      } else {
        seqB.push('R');
      }

      // Check mathematical elimination after both take kick
      const remainingB_afterKick = 5 - round;
      if (scoreA > scoreB + remainingB_afterKick) {
        return { winner: home, seqA, seqB };
      }
      if (scoreB > scoreA + remainingA_afterKick) {
        return { winner: away, seqA, seqB };
      }
    }

    // --- PHASE 2: SUDDEN DEATH (ROUND 6+) ---
    while (scoreA === scoreB) {
      const homeScored = Math.random() < homeProb;
      if (homeScored) {
        seqA.push('G');
        scoreA++;
      } else {
        seqA.push('R');
      }

      const awayScored = Math.random() < awayProb;
      if (awayScored) {
        seqB.push('G');
        scoreB++;
      } else {
        seqB.push('R');
      }
    }

    return {
      winner: scoreA > scoreB ? home : away,
      seqA,
      seqB,
    };
  }
}