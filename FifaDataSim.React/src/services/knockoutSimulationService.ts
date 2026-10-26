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

    if (legs !== 1 && legs !== 2) {
      throw new Error("Knockout matches must have either one or two legs.");
    }

    const leg1 = GroupMatchSimulationEngine.simulateMatch(
      match.teamA,
      match.teamB
    );

    const l1A = leg1.home;
    const l1B = leg1.away;

    let l2A: number | null = null;
    let l2B: number | null = null;

    if (legs === 2) {
      const leg2 = GroupMatchSimulationEngine.simulateMatch(
        match.teamB,
        match.teamA
      );

      l2A = leg2.away;
      l2B = leg2.home;
    }

    const baseResult = {
      ...match,
      leg1ScoreA: l1A,
      leg1ScoreB: l1B,
      leg2ScoreA: l2A,
      leg2ScoreB: l2B,
      extraTimeScoreA: null as number | null,
      extraTimeScoreB: null as number | null,
      penaltiesA: null as string[] | null,
      penaltiesB: null as string[] | null,
      isPlayed: true,
    };

    if (legs === 1) {
      if (l1A > l1B) {
        return {
          ...baseResult,
          winner: match.teamA,
          loser: match.teamB,
        };
      }

      if (l1B > l1A) {
        return {
          ...baseResult,
          winner: match.teamB,
          loser: match.teamA,
        };
      }

      const resolution = this.resolveKnockoutTie(
        match.teamA,
        match.teamB,
        l1A,
        l1B
      );

      return {
        ...baseResult,
        extraTimeScoreA: resolution.extraTimeHome,
        extraTimeScoreB: resolution.extraTimeAway,
        penaltiesA: resolution.penA,
        penaltiesB: resolution.penB,
        winner: resolution.winner,
        loser: resolution.loser,
      };
    }

    const aggA = l1A + (l2A ?? 0);
    const aggB = l1B + (l2B ?? 0);

    if (aggA > aggB) {
      return {
        ...baseResult,
        winner: match.teamA,
        loser: match.teamB,
      };
    }

    if (aggB > aggA) {
      return {
        ...baseResult,
        winner: match.teamB,
        loser: match.teamA,
      };
    }

    const resolution = this.resolveKnockoutTie(
      match.teamB,
      match.teamA,
      l2B ?? 0,
      l2A ?? 0
    );

    return {
      ...baseResult,

      extraTimeScoreA: resolution.extraTimeAway,
      extraTimeScoreB: resolution.extraTimeHome,

      penaltiesA: resolution.penB,
      penaltiesB: resolution.penA,

      winner: resolution.winner,
      loser: resolution.loser,
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
    const extraTime = this.simulateExtraTime(home, away);

    const finalHome = homeGoals + extraTime.home;
    const finalAway = awayGoals + extraTime.away;

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
    const expected =
      SimulationEngineService.calculateExpectedGoals(home, away);

    const homeLambda =
      (expected.home / 90) *
      30 *
      SimulationEngineService.randomPerformanceFactor();

    const awayLambda =
      (expected.away / 90) *
      30 *
      SimulationEngineService.randomPerformanceFactor();

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
      SimulationEngineService.PENALTY_CONVERSION_RATE +
        strengthAdjustment,
      0.68,
      0.82
    );
  }

  private static simulatePenaltyShootout(
    home: Country,
    away: Country
  ): {
    winner: Country;
    seqA: string[];
    seqB: string[];
  } {
    const homeProb = this.getPenaltyProbability(home, away);
    const awayProb = this.getPenaltyProbability(away, home);

    const seqA: string[] = [];
    const seqB: string[] = [];

    let scoreA = 0;
    let scoreB = 0;

    for (let round = 1; round <= 5; round++) {
      const homeScored = Math.random() < homeProb;
      seqA.push(homeScored ? "G" : "R");
      if (homeScored) scoreA++;

      const remainingAway = 5 - (round - 1);

      if (scoreA > scoreB + remainingAway) {
        return { winner: home, seqA, seqB };
      }

      const awayScored = Math.random() < awayProb;
      seqB.push(awayScored ? "G" : "R");
      if (awayScored) scoreB++;

      const remainingHome = 5 - round;
      const remainingAwayAfterKick = 5 - round;

      if (scoreA > scoreB + remainingAwayAfterKick) {
        return { winner: home, seqA, seqB };
      }

      if (scoreB > scoreA + remainingHome) {
        return { winner: away, seqA, seqB };
      }
    }

    while (scoreA === scoreB) {
      const homeScored = Math.random() < homeProb;
      seqA.push(homeScored ? "G" : "R");
      if (homeScored) scoreA++;

      const awayScored = Math.random() < awayProb;
      seqB.push(awayScored ? "G" : "R");
      if (awayScored) scoreB++;
    }

    return {
      winner: scoreA > scoreB ? home : away,
      seqA,
      seqB,
    };
  }
}
