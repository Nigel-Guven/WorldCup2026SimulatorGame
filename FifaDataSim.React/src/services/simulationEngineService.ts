
import type { Country } from "../types/country";

export class SimulationEngineService {
    static readonly BASE_HOME_GOALS = 1.35;
    static readonly BASE_AWAY_GOALS = 1.05;

    static readonly HOME_ADVANTAGE = 1.10;

    // Lower sensitivity than the original 0.02.
    static readonly STRENGTH_SENSITIVITY = 0.012;

    static readonly MAX_EXPECTED_GOALS = 4.5;
    static readonly MIN_EXPECTED_GOALS = 0.08;

    // Shared match conditions.
    static readonly MATCH_TEMPO_VARIANCE = 0.10;

    static clamp(
        value: number,
        min: number,
        max: number
    ): number {
        return Math.min(max, Math.max(min, value));
    }

    static randomNormal(
        mean = 0,
        standardDeviation = 1
    ): number {
        let u = 0;
        let v = 0;

        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();

        const standardNormal =
            Math.sqrt(-2 * Math.log(u)) *
            Math.cos(2 * Math.PI * v);

        return mean + standardNormal * standardDeviation;
    }

    static randomMatchTempo(): number {
        const variance = this.MATCH_TEMPO_VARIANCE;

        return Math.exp(
            this.randomNormal(
                -(variance ** 2) / 2,
                variance
            )
        );
    }

    static knuthPoissonRandom(lambda: number): number {
        const safeLambda = Math.max(0, lambda);
        const limit = Math.exp(-safeLambda);

        let k = 0;
        let p = 1;

        do {
            k++;
            p *= Math.random();
        } while (p > limit);

        return k - 1;
    }

    static calculateExpectedGoals(
        home: Country,
        away: Country,
        neutralVenue = false
    ): { home: number; away: number } {

        const homeStrength = this.clamp(
            home.strength, 1, 100
        );

        const awayStrength = this.clamp(
            away.strength, 1, 100
        );

        const strengthDifference =
            homeStrength - awayStrength;

        const strengthFactor = Math.exp(
            strengthDifference *
            this.STRENGTH_SENSITIVITY
        );

        const homeAdvantage = neutralVenue
            ? 1
            : this.HOME_ADVANTAGE;

        const homeLambda =
            this.BASE_HOME_GOALS *
            homeAdvantage *
            strengthFactor;

        const awayLambda =
            this.BASE_AWAY_GOALS /
            strengthFactor;

        return {
            home: this.clamp(
                homeLambda,
                this.MIN_EXPECTED_GOALS,
                this.MAX_EXPECTED_GOALS
            ),
            away: this.clamp(
                awayLambda,
                this.MIN_EXPECTED_GOALS,
                this.MAX_EXPECTED_GOALS
            )
        };
    }

    static simulateMatch(
        home: Country,
        away: Country,
        neutralVenue = false
    ): {
        homeGoals: number;
        awayGoals: number;
    } {

        const expected = this.calculateExpectedGoals(
            home,
            away,
            neutralVenue
        );

        const matchTempo = this.randomMatchTempo();

        const homeLambda = this.clamp(
            expected.home * matchTempo,
            this.MIN_EXPECTED_GOALS,
            this.MAX_EXPECTED_GOALS
        );

        const awayLambda = this.clamp(
            expected.away * matchTempo,
            this.MIN_EXPECTED_GOALS,
            this.MAX_EXPECTED_GOALS
        );

        return {
            homeGoals: this.knuthPoissonRandom(homeLambda),
            awayGoals: this.knuthPoissonRandom(awayLambda)
        };
    }
}
