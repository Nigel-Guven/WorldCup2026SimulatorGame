
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
            throw new Error(
                "Knockout matches must have either one or two legs."
            );
        }

        // First leg: Team A plays at home
        const leg1 = GroupMatchSimulationEngine.simulateMatch(
            match.teamA,
            match.teamB
        );

        const l1A = leg1.home;
        const l1B = leg1.away;

        let l2A: number | null = null;
        let l2B: number | null = null;

        // Second leg: Team B plays at home
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

        // SINGLE-LEG KNOCKOUT
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

            // Match is level after 90 minutes
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

        // TWO-LEGGED KNOCKOUT
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

        // Aggregate score is level.
        // Extra time is played at Team B's home ground.
        const resolution = this.resolveKnockoutTie(
            match.teamB,
            match.teamA,
            l2B ?? 0,
            l2A ?? 0
        );

        return {
            ...baseResult,

            // Convert second-leg home/away back to Team A/Team B
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

        // Still level after extra time: penalties
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

        // Expected goals are calculated using the updated
        // attack-versus-defence model.
        const expected =
            SimulationEngineService.calculateExpectedGoals(home, away);

        // Extra time is 30 minutes rather than 90.
        const matchTempo =
            SimulationEngineService.randomMatchTempo();

        const homeLambda =
            (expected.home / 3) * matchTempo;

        const awayLambda =
            (expected.away / 3) * matchTempo;

        return {
            home: SimulationEngineService.knuthPoissonRandom(homeLambda),
            away: SimulationEngineService.knuthPoissonRandom(awayLambda),
        };
    }

    private static getPenaltyProbability(
        team: Country,
        opponent: Country
    ): number {

        // Use combined attacking and defensive quality
        // as a proxy for overall team quality.
        const teamQuality = (
            team.strength_attack + team.strength_defence
        ) / 2;

        const opponentQuality = (
            opponent.strength_attack + opponent.strength_defence
        ) / 2;

        const strengthDifference =
            teamQuality - opponentQuality;

        const strengthAdjustment =
            strengthDifference * 0.0004;

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

        // First five penalties
        for (let round = 1; round <= 5; round++) {

            // Home penalty
            const homeScored = Math.random() < homeProb;

            seqA.push(homeScored ? "G" : "R");

            if (homeScored) scoreA++;

            // Check whether away can still catch home
            const remainingAway = 5 - (round - 1);

            if (scoreA > scoreB + remainingAway) {
                return { winner: home, seqA, seqB };
            }

            // Check whether home can still catch away
            const remainingHome = 5 - round + 1;

            if (scoreB > scoreA + remainingHome) {
                return { winner: away, seqA, seqB };
            }

            // Away penalty
            const awayScored = Math.random() < awayProb;

            seqB.push(awayScored ? "G" : "R");

            if (awayScored) scoreB++;

            // Check whether either team has mathematically won
            const remaining = 5 - round;

            if (scoreA > scoreB + remaining) {
                return { winner: home, seqA, seqB };
            }

            if (scoreB > scoreA + remaining) {
                return { winner: away, seqA, seqB };
            }
        }

        // Sudden death
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
