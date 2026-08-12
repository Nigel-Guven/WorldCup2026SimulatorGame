import type { Country } from "../types/country";
import type { KnockoutMatchup } from "../types/knockoutMatchup";

export class SimulationEngine {
  /**
   * Knuth's Poisson random number generator algorithm.
   */
  private static knuthPoissonRandom(lambda: number): number {
    const l = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;

    do {
      k++;
      p *= Math.random();
    } while (p > l);

    return k - 1;
  }

  /**
   * Resolves ties in knockout matches via extra time (Poisson) and penalty shootouts.
   */
  private static resolveKnockoutTie(
    home: Country,
    away: Country,
    homeGoals: number,
    awayGoals: number
  ): { winner: Country; scoreDisplay?: string; penA: number; penB: number } {
    let finalHome = homeGoals;
    let finalAway = awayGoals;

    // 1. Extra Time Poisson simulation (lower expectancy due to 30 mins)
    const etHomeGoals = SimulationEngine.knuthPoissonRandom(0.45);
    const etAwayGoals = SimulationEngine.knuthPoissonRandom(0.40);

    finalHome += etHomeGoals;
    finalAway += etAwayGoals;

    // 2. Penalty Shootout (weighted slightly by team strength)
    const homeProb = 0.5 + (home.strength - away.strength) * 0.01;
    const isHomeWinner = Math.random() < Math.max(0.2, Math.min(0.8, homeProb));

    const penA = isHomeWinner ? 5 : 4;
    const penB = isHomeWinner ? 4 : 5;
    const winner = isHomeWinner ? home : away;

    return {
      winner,
      scoreDisplay: `${finalHome}-${finalAway} (${penA}-${penB} pen)`,
      penA,
      penB,
    };
  }

  /**
   * Simulates a single match between two countries using Poisson expectancy.
   */
  public static simulateMatch(
    home: Country,
    away: Country
  ): { home: number; away: number } {
    const baseHomeExpectancy = 1.35;
    const baseAwayExpectancy = 1.20;

    const strengthDiff = home.strength - away.strength;
    const baseAdjustment = strengthDiff * 0.015;

    let homeLambda = Math.max(0.2, baseHomeExpectancy + baseAdjustment);
    let awayLambda = Math.max(0.2, baseAwayExpectancy - baseAdjustment);

    if (home.default_points > away.default_points) {
      homeLambda += 0.1;
    } else if (away.default_points > home.default_points) {
      awayLambda += 0.1;
    }

    const homeGoals = this.knuthPoissonRandom(homeLambda);
    const awayGoals = this.knuthPoissonRandom(awayLambda);

    return { home: homeGoals, away: awayGoals };
  }

  /**
   * Simulates a knockout matchup (single or 2-legged tie) using the Poisson engine.
   */
  public static simulateKnockoutMatch(
    match: KnockoutMatchup,
    legs: number = 1
  ): KnockoutMatchup {
    if (!match.teamA || !match.teamB) return match;

    // Leg 1 Simulation
    const l1 = this.simulateMatch(match.teamA, match.teamB);
    const l1A = l1.home;
    const l1B = l1.away;

    let l2A: number | null = null;
    let l2B: number | null = null;
    let penA: number | null = null;
    let penB: number | null = null;

    let aggA = l1A;
    let aggB = l1B;

    if (legs === 2) {
      // Leg 2 Simulation (teamB at home)
      const l2 = this.simulateMatch(match.teamB, match.teamA);
      l2A = l2.away; // teamA is away in leg 2
      l2B = l2.home; // teamB is home in leg 2
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
      // Tiebreaker via Poisson Extra Time / Penalty Shootout
      const tieRes = this.resolveKnockoutTie(match.teamA, match.teamB, aggA, aggB);
      winner = tieRes.winner;
      loser = winner.id === match.teamA.id ? match.teamB : match.teamA;
      penA = tieRes.penA;
      penB = tieRes.penB;
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
}