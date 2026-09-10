import { getTeamKey } from '../../components/tournament/execution/draws/GroupStageDrawView';
import { Confederation } from '../../types/confederation';
import type { Country } from '../../types/country';

export interface Fixture {
  id: string;
  groupKey: string;
  round: number;
  leg: number;
  homeTeam: Country | null;
  awayTeam: Country | null;
  homeScore: number | null;
  awayScore: number | null;
  isPlayed: boolean;
}

export interface GroupStandingRow {
  team: Country;
  groupKey: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export type TeamQualificationStatus =
  | 'qualified'
  | 'wildcard'
  | 'undecided'
  | 'eliminated';

export interface QualificationStatusOptions {
  directAdvanceCount: number;
  wildcardPosition: number;
  wildcardCount: number;
}

export interface QualificationContext {
  standings: Record<string, GroupStandingRow[]>;
  fixtures: Fixture[];
}

export class GroupSimulationUtils {

  static generateGroupFixtures(
    groups: Record<string, Country[]>,
    legs: number = 1
  ): Fixture[] {
    const fixturesByRound: Record<number, Fixture[]> = {};

    Object.entries(groups).forEach(([groupKey, teams]) => {
      const list = [...teams];

      const isOdd = list.length % 2 !== 0;

      if (isOdd) {
        const dummyBye: Country = {
          id: '__BYE__',
          name: 'BYE',
          short_name: 'BYE',
          flag_url: '',
          confederation: Confederation.CONMEBOL,
          football_association: '',
          default_points: 0,
          strength: 0,
          home_stadium: '',
          form: '',
        };

        list.push(dummyBye);
      }

      const numTeams = list.length;
      const roundsPerLeg = numTeams - 1;
      const matchesPerRound = numTeams / 2;

      for (let leg = 1; leg <= legs; leg++) {
        for (let round = 0; round < roundsPerLeg; round++) {
          const roundNumber =
            (leg - 1) * roundsPerLeg + (round + 1);

          for (let m = 0; m < matchesPerRound; m++) {
            const homeIdx =
              (round + m) % (numTeams - 1);

            let awayIdx =
              (numTeams - 1 - m + round) %
              (numTeams - 1);

            if (m === 0) {
              awayIdx = numTeams - 1;
            }

            let home = list[homeIdx];
            let away = list[awayIdx];

            // Ignore double BYE matches
            if (
              home.id === '__BYE__' &&
              away.id === '__BYE__'
            ) {
              continue;
            }

            // Reverse home/away for Leg 2
            if (leg === 2) {
              const temp = home;
              home = away;
              away = temp;
            }

            const isHomeBye = home.id === '__BYE__';
            const isAwayBye = away.id === '__BYE__';

            const fixture: Fixture = {
              id: `${groupKey}-L${leg}-R${roundNumber}-M${m}`,
              groupKey,
              round: roundNumber,
              leg,
              homeTeam: isHomeBye ? null : home,
              awayTeam: isAwayBye ? null : away,
              homeScore:
                isHomeBye || isAwayBye ? 0 : null,
              awayScore:
                isHomeBye || isAwayBye ? 0 : null,
              isPlayed: isHomeBye || isAwayBye,
            };

            if (!fixturesByRound[roundNumber]) {
              fixturesByRound[roundNumber] = [];
            }

            fixturesByRound[roundNumber].push(fixture);
          }
        }
      }
    });

    return Object.keys(fixturesByRound)
      .map(Number)
      .sort((a, b) => a - b)
      .flatMap((round) => fixturesByRound[round]);
  }

  static computeGroupStandings(
    groups: Record<string, Country[]>,
    fixtures: Fixture[]
  ): Record<string, GroupStandingRow[]> {
    const standings: Record<string, GroupStandingRow[]> = {};


    Object.entries(groups).forEach(([groupKey, teams]) => {
      standings[groupKey] = teams.map((team) => ({
        team,
        groupKey,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      }));
    });

    fixtures.forEach((f) => {
      if (!f.isPlayed || !f.homeTeam || !f.awayTeam || f.homeScore === null || f.awayScore === null) {
        return;
      }

      const groupRows = standings[f.groupKey];
      if (!groupRows) return;

      const homeRow = groupRows.find((r) => String(r.team.id) === String(f.homeTeam!.id));
      const awayRow = groupRows.find((r) => String(r.team.id) === String(f.awayTeam!.id));

      if (homeRow && awayRow) {
        homeRow.played += 1;
        awayRow.played += 1;
        homeRow.gf += f.homeScore;
        homeRow.ga += f.awayScore;
        awayRow.gf += f.awayScore;
        awayRow.ga += f.homeScore;
        homeRow.gd = homeRow.gf - homeRow.ga;
        awayRow.gd = awayRow.gf - awayRow.ga;

        if (f.homeScore > f.awayScore) {
          homeRow.won += 1;
          homeRow.points += 3;
          awayRow.lost += 1;
        } else if (f.homeScore < f.awayScore) {
          awayRow.won += 1;
          awayRow.points += 3;
          homeRow.lost += 1;
        } else {
          homeRow.drawn += 1;
          awayRow.drawn += 1;
          homeRow.points += 1;
          awayRow.points += 1;
        }
      }
    });

    // Sort group tables: Points -> Goal Difference -> Goals For -> Name
    Object.keys(standings).forEach((groupKey) => {
      standings[groupKey].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.team.name.localeCompare(b.team.name);
      });
    });

    return standings;
  }

  static computeWildcardStandings(
    standings: Record<string, GroupStandingRow[]>,
    wildcardIndex: number 
  ): GroupStandingRow[] {
    if (wildcardIndex <= 0) return [];

    const wildcardCandidates: GroupStandingRow[] = [];
    const arrayIdx = wildcardIndex - 1;

    Object.values(standings).forEach((rows) => {
      if (rows[arrayIdx]) {
        wildcardCandidates.push(rows[arrayIdx]);
      }
    });

    return wildcardCandidates.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.played - b.played;
    });
  }

  static getTeamQualificationStatus(
    team: Country,
    context: QualificationContext,
    options: QualificationStatusOptions
  ): TeamQualificationStatus {
    const {
      standings,
      fixtures,
    } = context;

    const {
      directAdvanceCount,
      wildcardPosition,
      wildcardCount,
    } = options;

    const teamKey = getTeamKey(team);

    const getRemainingMatches = (candidate: Country): Fixture[] => {
      const candidateKey = getTeamKey(candidate);

      return fixtures.filter(
        (fixture) =>
          !fixture.isPlayed &&
          fixture.homeTeam &&
          fixture.awayTeam &&
          (
            getTeamKey(fixture.homeTeam) === candidateKey ||
            getTeamKey(fixture.awayTeam) === candidateKey
          )
      );
    };

    const getMaximumPoints = (row: GroupStandingRow): number => {
      const remainingMatches = getRemainingMatches(row.team).length;

      return row.points + remainingMatches * 3;
    };

    const currentGroupEntry = Object.entries(standings).find(
      ([, rows]) =>
        rows.some(
          (row) => getTeamKey(row.team) === teamKey
        )
    );

    if (!currentGroupEntry) {
      return 'undecided';
    }

    const [groupKey, groupRows] = currentGroupEntry;

    const teamRow = groupRows.find(
      (row) => getTeamKey(row.team) === teamKey
    );

    if (!teamRow) {
      return 'undecided';
    }

    const teamMaximumPoints = getMaximumPoints(teamRow);

    const teamsThatCanDefinitelyFinishAbove = groupRows.filter(
      (other) => {
        if (getTeamKey(other.team) === teamKey) {
          return false;
        }

        return getMaximumPoints(other) > teamMaximumPoints;
      }
    ).length;

    const cannotDirectQualify =
      teamsThatCanDefinitelyFinishAbove >= directAdvanceCount;

    const teamsThatCanCatchTeam = groupRows.filter(
      (other) => {
        if (getTeamKey(other.team) === teamKey) {
          return false;
        }

        return getMaximumPoints(other) >= teamRow.points;
      }
    ).length;

    const guaranteedDirectQualification =
      teamsThatCanCatchTeam < directAdvanceCount;

    if (guaranteedDirectQualification) {
      return 'qualified';
    }

    if (wildcardPosition <= 0 || wildcardCount <= 0) {
      return cannotDirectQualify
        ? 'eliminated'
        : 'undecided';
    }

    const teamsThatCanFinishAboveWildcardPosition =
      groupRows.filter((other) => {
        if (getTeamKey(other.team) === teamKey) {
          return false;
        }

        return getMaximumPoints(other) > teamMaximumPoints;
      }).length;

    const canReachWildcardPosition =
      teamsThatCanFinishAboveWildcardPosition < wildcardPosition;

    if (!canReachWildcardPosition) {
      return 'eliminated';
    }

    const wildcardCandidates = Object.entries(standings)
      .flatMap(([candidateGroupKey, rows]) => {
        return rows
          .filter((row) => {

            const candidateMaximumPoints =
              getMaximumPoints(row);

            const teamsAboveCandidate =
              rows.filter(
                (other) =>
                  getTeamKey(other.team) !==
                    getTeamKey(row.team) &&
                  getMaximumPoints(other) >
                    candidateMaximumPoints
              ).length;

            return teamsAboveCandidate < wildcardPosition;
          })
          .map((row) => ({
            groupKey: candidateGroupKey,
            row,
          }));
      });

    const wildcardTeamsThatCanFinishAhead =
      wildcardCandidates.filter(({ row }) => {
        if (getTeamKey(row.team) === teamKey) {
          return false;
        }

        return getMaximumPoints(row) >= teamRow.points;
      }).length;

    if (wildcardTeamsThatCanFinishAhead < wildcardCount) {
      return 'wildcard';
    }

    return 'undecided';
  }
}