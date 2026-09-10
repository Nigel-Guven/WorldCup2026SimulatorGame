import type { Country } from "../types/country";
import type { KnockoutMatchup } from "../types/knockoutMatchup";

export class SimulationEngine {
  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  private static readonly BASE_HOME_GOALS = 1.35;
  private static readonly BASE_AWAY_GOALS = 1.05;
  private static readonly AVERAGE_STRENGTH = 50;
  private static readonly STRENGTH_CURVE = 0.75;
  private static readonly HOME_ADVANTAGE = 1.10;
  private static readonly MAX_EXPECTED_GOALS = 4.5;
  private static readonly MIN_EXPECTED_GOALS = 0.08;
  private static readonly MATCH_VARIANCE = 0.12;
  private static readonly DEFAULT_POINTS_WEIGHT = 0.08;
  private static readonly EXTRA_TIME_HOME_GOALS = 0.40;
  private static readonly EXTRA_TIME_AWAY_GOALS = 0.34;
  private static readonly PENALTY_CONVERSION_RATE = 0.76;

  private static knuthPoissonRandom(lambda: number): number {
    const safeLambda = Math.max(0, lambda);

    const l = Math.exp(-safeLambda);

    let k = 0;
    let p = 1.0;

    do {
      k++;
      p *= Math.random();
    } while (p > l);

    return k - 1;
  }

  private static randomNormal(
    mean = 0,
    standardDeviation = 1
  ): number {
    let u = 0;
    let v = 0;

    while (u === 0) {
      u = Math.random();
    }

    while (v === 0) {
      v = Math.random();
    }

    const standardNormal =
      Math.sqrt(-2.0 * Math.log(u)) *
      Math.cos(2.0 * Math.PI * v);

    return mean + standardNormal * standardDeviation;
  }

  private static randomPerformanceFactor(): number {
    const variation = this.randomNormal(
      0,
      this.MATCH_VARIANCE
    );

    return Math.exp(variation);
  }

  private static clamp(
    value: number,
    min: number,
    max: number
  ): number {
    return Math.min(max, Math.max(min, value));
  }

  private static getQuality(strength: number): number {
    const normalized = this.clamp(strength, 1, 100) /
      this.AVERAGE_STRENGTH;

    return Math.pow(
      normalized,
      this.STRENGTH_CURVE
    );
  }

  private static getDefaultPointsFactor(
    country: Country
  ): number {
    const points = Math.max(
      0,
      country.default_points ?? 0
    );

    const normalizedPoints = Math.log1p(points);

    return normalizedPoints;
  }

  private static getEffectiveQuality(
    country: Country
  ): number {
    const quality = this.getQuality(country.strength);

    const pointsFactor =
      this.getDefaultPointsFactor(country);

    const pointsAdjustment =
      1 +
      (pointsFactor * this.DEFAULT_POINTS_WEIGHT);

    return quality * pointsAdjustment;
  }

  private static getAttackRating(
    country: Country
  ): number {
    return this.getEffectiveQuality(country);
  }

  private static getDefenseRating(
    country: Country
  ): number {
    return this.getEffectiveQuality(country);
  }

  private static calculateExpectedGoals(
    home: Country,
    away: Country
  ): {
    home: number;
    away: number;
  } {
    const homeAttack =
      this.getAttackRating(home);

    const homeDefense =
      this.getDefenseRating(home);

    const awayAttack =
      this.getAttackRating(away);

    const awayDefense =
      this.getDefenseRating(away);

    const homeAttackFactor =
      homeAttack /
      Math.pow(awayDefense, 0.35);

    const awayAttackFactor =
      awayAttack /
      Math.pow(homeDefense, 0.35);

    let homeLambda =
      this.BASE_HOME_GOALS *
      homeAttackFactor *
      this.HOME_ADVANTAGE;

    let awayLambda =
      this.BASE_AWAY_GOALS *
      awayAttackFactor;

    homeLambda *=
      this.randomPerformanceFactor();

    awayLambda *=
      this.randomPerformanceFactor();

    homeLambda = this.clamp(
      homeLambda,
      this.MIN_EXPECTED_GOALS,
      this.MAX_EXPECTED_GOALS
    );

    awayLambda = this.clamp(
      awayLambda,
      this.MIN_EXPECTED_GOALS,
      this.MAX_EXPECTED_GOALS
    );

    return {
      home: homeLambda,
      away: awayLambda,
    };
  }

  public static simulateMatch(
    home: Country,
    away: Country
  ): {
    home: number;
    away: number;
  } {
    const expectedGoals =
      this.calculateExpectedGoals(
        home,
        away
      );

    const homeGoals =
      this.knuthPoissonRandom(
        expectedGoals.home
      );

    const awayGoals =
      this.knuthPoissonRandom(
        expectedGoals.away
      );

    return {
      home: homeGoals,
      away: awayGoals,
    };
  }

  private static simulateExtraTime(
    home: Country,
    away: Country
  ): {
    home: number;
    away: number;
  } {

    const homeQuality =
      this.getEffectiveQuality(home);

    const awayQuality =
      this.getEffectiveQuality(away);

    const qualityRatio =
      homeQuality /
      Math.max(0.1, awayQuality);

    const inverseQualityRatio =
      awayQuality /
      Math.max(0.1, homeQuality);

    let homeLambda =
      this.EXTRA_TIME_HOME_GOALS *
      Math.pow(qualityRatio, 0.15) *
      this.randomPerformanceFactor();

    let awayLambda =
      this.EXTRA_TIME_AWAY_GOALS *
      Math.pow(inverseQualityRatio, 0.15) *
      this.randomPerformanceFactor();

    homeLambda = this.clamp(
      homeLambda,
      0,
      1.5
    );

    awayLambda = this.clamp(
      awayLambda,
      0,
      1.5
    );

    return {
      home: this.knuthPoissonRandom(homeLambda),
      away: this.knuthPoissonRandom(awayLambda),
    };
  }

  private static getPenaltyProbability(
    team: Country,
    opponent: Country
  ): number {
    const strengthDifference =
      team.strength - opponent.strength;

    const strengthAdjustment =
      strengthDifference * 0.0004;

    return this.clamp(
      this.PENALTY_CONVERSION_RATE +
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
    penA: number;
    penB: number;
  } {
    const homeProbability =
      this.getPenaltyProbability(
        home,
        away
      );

    const awayProbability =
      this.getPenaltyProbability(
        away,
        home
      );

    let homeScore = 0;
    let awayScore = 0;

    for (let i = 0; i < 5; i++) {
      const homeScored =
        Math.random() < homeProbability;

      const awayScored =
        Math.random() < awayProbability;

      if (homeScored) {
        homeScore++;
      }

      if (awayScored) {
        awayScore++;
      }

      const remaining =
        4 - i;

      if (
        homeScore >
        awayScore + remaining
      ) {
        return {
          winner: home,
          penA: homeScore,
          penB: awayScore,
        };
      }

      if (
        awayScore >
        homeScore + remaining
      ) {
        return {
          winner: away,
          penA: homeScore,
          penB: awayScore,
        };
      }
    }

    while (true) {
      const homeScored =
        Math.random() < homeProbability;

      const awayScored =
        Math.random() < awayProbability;

      if (homeScored) {
        homeScore++;
      }

      if (awayScored) {
        awayScore++;
      }

      if (homeScored === awayScored) {
        continue;
      }

      return {
        winner:
          homeScore > awayScore
            ? home
            : away,

        penA: homeScore,
        penB: awayScore,
      };
    }
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
    penA: number | null;
    penB: number | null;
  } {
    let finalHome = homeGoals;
    let finalAway = awayGoals;

    const extraTime =
      this.simulateExtraTime(
        home,
        away
      );

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

    const penalties =
      this.simulatePenaltyShootout(
        home,
        away
      );

    return {
      winner: penalties.winner,
      loser:
        penalties.winner.id === home.id
          ? away
          : home,

      extraTimeHome: extraTime.home,
      extraTimeAway: extraTime.away,

      finalHome,
      finalAway,

      penA: penalties.penA,
      penB: penalties.penB,
    };
  }

  public static simulateKnockoutMatch(
    match: KnockoutMatchup,
    legs: number = 1
  ): KnockoutMatchup {
    if (
      !match.teamA ||
      !match.teamB
    ) {
      return match;
    }

    const leg1 =
      this.simulateMatch(
        match.teamA,
        match.teamB
      );

    const l1A = leg1.home;
    const l1B = leg1.away;

    let l2A: number | null = null;
    let l2B: number | null = null;

    if (legs === 2) {
      const leg2 =
        this.simulateMatch(
          match.teamB,
          match.teamA
        );

      l2B = leg2.home;
      l2A = leg2.away;
    }

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

      const resolution =
        this.resolveKnockoutTie(
          match.teamA,
          match.teamB,
          l1A,
          l1B
        );

      return {
        ...match,

        leg1ScoreA:
          resolution.finalHome,
        leg1ScoreB:
          resolution.finalAway,

        leg2ScoreA: null,
        leg2ScoreB: null,

        penaltiesA:
          resolution.penA,
        penaltiesB:
          resolution.penB,

        winner: resolution.winner,
        loser: resolution.loser,

        isPlayed: true,
      };
    }

    const aggA =
      l1A + (l2A ?? 0);

    const aggB =
      l1B + (l2B ?? 0);

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

    const resolution =
      this.resolveKnockoutTie(
        match.teamB,
        match.teamA,
        l2B ?? 0,
        l2A ?? 0
      );

    const finalLeg2B =
      resolution.finalHome;

    const finalLeg2A =
      resolution.finalAway;

    return {
      ...match,

      leg1ScoreA: l1A,
      leg1ScoreB: l1B,

      leg2ScoreA: finalLeg2A,
      leg2ScoreB: finalLeg2B,

      penaltiesA:
        resolution.penA === null
          ? null
          : resolution.penA,

      penaltiesB:
        resolution.penB === null
          ? null
          : resolution.penB,

      winner: resolution.winner,
      loser: resolution.loser,

      isPlayed: true,
    };
  }
}