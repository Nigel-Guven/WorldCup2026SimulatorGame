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

export type QualificationStatus = 'Q' | 'X' | 'E';

export interface QualificationResult {
    teamId: string;
    status: QualificationStatus;
    bestPossibleRank: number;
    worstPossibleRank: number;
}

export class SwissSimulationUtils {

  static getQualificationStatus(
        bestPossibleRank: number,
        worstPossibleRank: number,
        directAdvanceCount: number,
        playoffStartPosition: number,
        playoffTeamsCount: number
    ): QualificationStatus {

      const playoffEndPosition =
          playoffStartPosition + playoffTeamsCount - 1;

      const qualificationEndPosition = Math.max(
              directAdvanceCount,
              playoffEndPosition
      );

      if (worstPossibleRank <= directAdvanceCount) {
          return 'Q';
      }

      if (bestPossibleRank <= qualificationEndPosition) {
          return 'X';
      }

      return 'E';
    }

  static computeQualificationResults(
      teams: Country[],
      fixtures: SwissFixture[],
      directAdvanceCount: number,
      playoffStartPosition: number,
      playoffTeamsCount: number
  ): QualificationResult[] {

      const standings = this.computeStandings(teams, fixtures);

      const remainingMatches = new Map<string | number, number>();

      teams.forEach(team => {
          remainingMatches.set(team.id, 0);
      });

      // Count each team's remaining fixtures.
      fixtures.forEach(fixture => {
          if (
              fixture.isPlayed ||
              !fixture.homeTeam ||
              !fixture.awayTeam
          ) {
              return;
          }

          remainingMatches.set(
              fixture.homeTeam.id,
              (remainingMatches.get(fixture.homeTeam.id) ?? 0) + 1
          );

          remainingMatches.set(
              fixture.awayTeam.id,
              (remainingMatches.get(fixture.awayTeam.id) ?? 0) + 1
          );
      });

      const playoffEndPosition =
          playoffStartPosition + playoffTeamsCount - 1;

      const qualificationEndPosition = Math.max(
          directAdvanceCount,
          playoffEndPosition
      );

      return standings.map(teamStanding => {

          const teamId = teamStanding.team.id;

          const teamRemainingMatches =
              remainingMatches.get(teamId) ?? 0;

          const maximumPoints =
              teamStanding.points + (teamRemainingMatches * 3);

          let guaranteedAheadCount = 0;
          let potentiallyAheadCount = 0;

          standings.forEach(opponent => {

              if (opponent.team.id === teamId) {
                  return;
              }

              const opponentRemainingMatches =
                  remainingMatches.get(opponent.team.id) ?? 0;

              const opponentMaximumPoints =
                  opponent.points + (opponentRemainingMatches * 3);

              // Opponent is guaranteed to finish ahead.
              // Even if this team wins every remaining match,
              // the opponent already has more points.
              if (opponent.points > maximumPoints) {
                  guaranteedAheadCount++;
              }

              // Opponent could potentially finish ahead.
              // Equal points are included because goal difference
              // and goals scored can determine the final ranking.
              if (opponentMaximumPoints >= teamStanding.points) {
                  potentiallyAheadCount++;
              }
          });

          const bestPossibleRank =
              guaranteedAheadCount + 1;

          const worstPossibleRank =
              potentiallyAheadCount + 1;

          const status = this.getQualificationStatus(
              bestPossibleRank,
              worstPossibleRank,
              directAdvanceCount,
              playoffStartPosition,
              playoffTeamsCount
          );

          return {
              teamId: String(teamId),
              status,
              bestPossibleRank,
              worstPossibleRank
          };
      });
  }

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

  static generateInitialFixtures(
    teams: Country[],
    numberOfMatches: number,
    numberOfLegs: number = 1
  ): SwissFixture[] {
    const fixtures: SwissFixture[] = [];
    const teamCount = teams.length;
    if (teamCount < 2) return fixtures;

    const playedPairs = new Set<string>();

    for (let round = 0; round < numberOfMatches; round++) {
      const shuffled = [...teams].sort(() => 0.5 - Math.random());
      const usedInRound = new Set<string | number>();

      for (let i = 0; i < shuffled.length; i++) {
        const teamA = shuffled[i];
        if (usedInRound.has(teamA.id)) continue;

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

          // Leg 1
          fixtures.push({
            id: `r${round + 1}-m${fixtures.length + 1}-l1`,
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

          // Leg 2 (Reverse fixtures if 2 legs are configured)
          if (numberOfLegs === 2) {
            fixtures.push({
              id: `r${round + 1}-m${fixtures.length + 1}-l2`,
              roundIndex: round,
              round: round + 1,
              groupKey: 'Swiss',
              leg: 2,
              homeTeam: teamB, // Swapped home/away
              awayTeam: teamA,
              homeScore: null,
              awayScore: null,
              isPlayed: false,
            });
          }
        }
      }
    }

    return fixtures;
  }
}