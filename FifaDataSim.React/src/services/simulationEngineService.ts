import type { Country } from "../types/country";

export class SimulationEngineService {
    static readonly BASE_HOME_GOALS = 1.35;
    static readonly BASE_AWAY_GOALS = 1.05;
    static readonly AVERAGE_STRENGTH = 50;
    static readonly STRENGTH_CURVE = 0.75;
    static readonly HOME_ADVANTAGE = 1.10;
    static readonly MAX_EXPECTED_GOALS = 4.5;
    static readonly MIN_EXPECTED_GOALS = 0.08;
    static readonly MATCH_VARIANCE = 0.12;
    static readonly DEFAULT_POINTS_WEIGHT = 0.08;
    static readonly EXTRA_TIME_HOME_GOALS = 0.40;
    static readonly EXTRA_TIME_AWAY_GOALS = 0.34;
    static readonly PENALTY_CONVERSION_RATE = 0.76;

    public static knuthPoissonRandom(lambda: number): number {
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

    public static randomNormal(
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

    public static randomPerformanceFactor(): number {
    const variation = this.randomNormal(
        0,
        this.MATCH_VARIANCE
    );

    return Math.exp(variation);
    }

    static clamp(
    value: number,
    min: number,
    max: number
    ): number {
    return Math.min(max, Math.max(min, value));
    }

    public static getQuality(strength: number): number {
    const normalized = this.clamp(strength, 1, 100) /
        this.AVERAGE_STRENGTH;

    return Math.pow(
        normalized,
        this.STRENGTH_CURVE
    );
    }

    public static getDefaultPointsFactor(
    country: Country
    ): number {
    const points = Math.max(
        0,
        country.default_points ?? 0
    );

    const normalizedPoints = Math.log1p(points);

    return normalizedPoints;
    }

    public static getEffectiveQuality(
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

    public static getAttackRating(
    country: Country
    ): number {
    return this.getEffectiveQuality(country);
    }

    public static getDefenseRating(
    country: Country
    ): number {
    return this.getEffectiveQuality(country);
    }

    public static calculateExpectedGoals(
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
}