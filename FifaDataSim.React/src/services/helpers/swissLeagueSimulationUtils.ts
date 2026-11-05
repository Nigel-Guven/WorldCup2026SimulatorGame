import type { Country } from "../../types/country";

export interface SwissFixture {
  id: string;
  homeTeam: Country | null;
  awayTeam: Country | null;
  homeScore: number | null;
  awayScore: number | null;
  isPlayed: boolean;
  roundIndex?: number;
  groupKey?: string;
  round?: number;
  leg?: number;
}

export interface SwissStandingEntry {
  team: Country;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  rank: number;
}

export class SwissSimulationUtils {
  /**
   * Computes a unified league standing table sorted by points, goal difference, and goals for.
   */
  static computeStandings(teams: Country[], fixtures: SwissFixture[]): SwissStandingEntry[] {
    const statsMap = new Map<string | number, {
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
    }>();

    teams.forEach((t) => {
      statsMap.set(t.id, { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });
    });

    fixtures.forEach((f) => {
      if (!f.isPlayed || !f.homeTeam || !f.awayTeam || f.homeScore === null || f.awayScore === null) return;

      const homeStats = statsMap.get(f.homeTeam.id);
      const awayStats = statsMap.get(f.awayTeam.id);
      if (!homeStats || !awayStats) return;

      homeStats.played += 1;
      awayStats.played += 1;
      homeStats.goalsFor += f.homeScore;
      homeStats.goalsAgainst += f.awayScore;
      awayStats.goalsFor += f.awayScore;
      awayStats.goalsAgainst += f.homeScore;

      if (f.homeScore > f.awayScore) {
        homeStats.won += 1;
        homeStats.points += 3;
        awayStats.lost += 1;
      } else if (f.homeScore < f.awayScore) {
        awayStats.won += 1;
        awayStats.points += 3;
        homeStats.lost += 1;
      } else {
        homeStats.drawn += 1;
        homeStats.points += 1;
        awayStats.drawn += 1;
        awayStats.points += 1;
      }
    });

    const entries: SwissStandingEntry[] = teams.map((team) => {
      const s = statsMap.get(team.id)!;
      const goalDifference = s.goalsFor - s.goalsAgainst;
      return {
        team,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference,
        points: s.points,
        rank: 0,
      };
    });

    // Sort by Points -> Goal Difference -> Goals For
    entries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    return entries;
  }

  /**
   * Generates initial Round 1 fixtures (either random or pot-seeded).
   */
  static generateInitialFixtures(teams: Country[], numberOfMatches: number): SwissFixture[] {
    const fixtures: SwissFixture[] = [];
    const teamCount = teams.length;
    if (teamCount < 2) return fixtures;

    // Track match history to avoid duplicate pairings across rounds
    const playedPairs = new Set<string>();

    for (let round = 0; round < numberOfMatches; round++) {
      const shuffled = [...teams].sort(() => 0.5 - Math.random());
      const usedInRound = new Set<string | number>();

      for (let i = 0; i < shuffled.length; i++) {
        const teamA = shuffled[i];
        if (usedInRound.has(teamA.id)) continue;

        // Find an available opponent teamA hasn't played yet
        const teamB = shuffled.find(
          (t) =>
            t.id !== teamA.id &&
            !usedInRound.has(t.id) &&
            !playedPairs.has(`${teamA.id}-${t.id}`) &&
            !playedPairs.has(`${t.id}-${teamA.id}`)
        ) || shuffled.find((t) => t.id !== teamA.id && !usedInRound.has(t.id));

        if (teamB) {
          usedInRound.add(teamA.id);
          usedInRound.add(teamB.id);
          playedPairs.add(`${teamA.id}-${teamB.id}`);

          fixtures.push({
            id: `r${round + 1}-m${fixtures.length + 1}`,
            roundIndex: round,
            round: round + 1,
            groupKey: 'Swiss',
            leg: 1,
            homeTeam: teamA,
            awayTeam: teamB,
            homeScore: null,
            awayScore: null,
            isPlayed: false,
          });
        }
      }
    }

    return fixtures;
  }
}