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
  legs: number;
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
          isStarred: false,
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

    /*
    * Find the group containing this team.
    */
    const currentGroupEntry = Object.entries(
      standings
    ).find(([, rows]) =>
      rows.some(
        (row) =>
          getTeamKey(row.team) === teamKey
      )
    );

    if (!currentGroupEntry) {
      return "undecided";
    }

    const [, groupRows] = currentGroupEntry;

    const teamRow = groupRows.find(
      (row) =>
        getTeamKey(row.team) === teamKey
    );

    if (!teamRow) {
      return "undecided";
    }

    /*
    * =========================================================
    * 1. CHECK WHETHER THE GROUP IS COMPLETED
    * =========================================================
    *
    * Once every fixture involving teams in this group has
    * been played, there is no longer any mathematical
    * possibility to move positions.
    *
    * At that point we MUST use the actual table position.
    *
    * This is especially important when teams are tied on
    * points and GD/tie-breakers determine their final order.
    *
    * Example:
    *
    *   3 Karen State      14 pts, +6 GD -> X
    *   4 Saint Helena     14 pts,  0 GD -> E
    *
    * Both have 14 points, but Karen State is officially 3rd.
    */

    const groupTeamKeys = new Set(
      groupRows.map((row) =>
        getTeamKey(row.team)
      )
    );

    const groupFixtures = fixtures.filter(
      (fixture) => {
        if (
          !fixture.homeTeam ||
          !fixture.awayTeam
        ) {
          return false;
        }

        const homeKey =
          getTeamKey(fixture.homeTeam);

        const awayKey =
          getTeamKey(fixture.awayTeam);

        return (
          groupTeamKeys.has(homeKey) &&
          groupTeamKeys.has(awayKey)
        );
      }
    );

    const groupHasUnplayedFixtures =
      groupFixtures.some(
        (fixture) => !fixture.isPlayed
      );

    /*
    * The standings array is already ordered according
    * to the competition's current tie-break rules.
    */
    if (!groupHasUnplayedFixtures) {
      const finalRank =
        groupRows.findIndex(
          (row) =>
            getTeamKey(row.team) === teamKey
        ) + 1;

      /*
      * Direct qualification.
      */
      if (
        finalRank > 0 &&
        finalRank <= directAdvanceCount
      ) {
        return "qualified";
      }

      /*
      * Wildcard qualification route.
      *
      * IMPORTANT:
      * X means the team occupies the wildcard position.
      * It does NOT mean the team has won the wildcard.
      */
      if (
        wildcardCount > 0 &&
        wildcardPosition > directAdvanceCount &&
        finalRank === wildcardPosition
      ) {
        return "wildcard";
      }

      /*
      * Everyone below the wildcard position is eliminated.
      */
      if (
        wildcardCount > 0 &&
        wildcardPosition > directAdvanceCount &&
        finalRank > wildcardPosition
      ) {
        return "eliminated";
      }

      /*
      * If there is no wildcard route, anyone outside the
      * direct positions is eliminated.
      */
      return "eliminated";
    }

    /*
    * =========================================================
    * 2. GROUP IS STILL IN PROGRESS
    * =========================================================
    */

    const getRemainingMatches = (
      candidate: Country
    ): Fixture[] => {
      const candidateKey =
        getTeamKey(candidate);

      return fixtures.filter(
        (fixture) =>
          !fixture.isPlayed &&
          fixture.homeTeam &&
          fixture.awayTeam &&
          (
            getTeamKey(fixture.homeTeam) ===
              candidateKey ||
            getTeamKey(fixture.awayTeam) ===
              candidateKey
          )
      );
    };

    const getMaximumPoints = (
      row: GroupStandingRow
    ): number => {
      const remainingMatches =
        getRemainingMatches(row.team).length;

      return (
        row.points +
        remainingMatches * 3
      );
    };

    const teamMaximumPoints =
      getMaximumPoints(teamRow);

    /*
    * =========================================================
    * 3. IS DIRECT QUALIFICATION GUARANTEED?
    * =========================================================
    *
    * For a team to be guaranteed a direct place, fewer than
    * directAdvanceCount teams must be capable of finishing
    * above it.
    *
    * We use the team's CURRENT points here because the team
    * could theoretically gain zero more points.
    *
    * A team currently tied with us and already above us in
    * the table is also treated as being ahead.
    */

    const teamsThatCanFinishAboveDirect =
      groupRows.filter((other) => {
        if (
          getTeamKey(other.team) === teamKey
        ) {
          return false;
        }

        const otherMaximumPoints =
          getMaximumPoints(other);

        /*
        * Other team already has more points.
        */
        if (
          other.points >
          teamRow.points
        ) {
          return true;
        }

        /*
        * Same current points, but currently above us
        * according to the standings/tie-break order.
        */
        if (
          other.points ===
          teamRow.points
        ) {
          const otherIndex =
            groupRows.indexOf(other);

          const teamIndex =
            groupRows.indexOf(teamRow);

          if (
            otherIndex < teamIndex
          ) {
            return true;
          }
        }

        /*
        * Other team can reach or exceed our current points
        * from below.
        */
        return (
          otherMaximumPoints >
          teamRow.points
        );
      }).length;

    const guaranteedDirectQualification =
      teamsThatCanFinishAboveDirect <
      directAdvanceCount;

    if (guaranteedDirectQualification) {
      return "qualified";
    }

    /*
    * =========================================================
    * 4. CAN DIRECT QUALIFICATION STILL HAPPEN?
    * =========================================================
    *
    * Now we look at the team's MAXIMUM possible points.
    *
    * If enough teams are already guaranteed to finish above
    * that maximum, the team can no longer reach a direct
    * qualification position.
    */

    const teamsGuaranteedAboveMaximum =
      groupRows.filter((other) => {
        if (
          getTeamKey(other.team) === teamKey
        ) {
          return false;
        }

        return (
          other.points >
          teamMaximumPoints
        );
      }).length;

    const canStillDirectQualify =
      teamsGuaranteedAboveMaximum <
      directAdvanceCount;

    /*
    * Direct qualification is still possible.
    *
    * Therefore do NOT show X yet.
    */
    if (canStillDirectQualify) {
      return "undecided";
    }

    /*
    * =========================================================
    * 5. CAN STILL REACH THE WILDCARD POSITION?
    * =========================================================
    *
    * The wildcard position is a position in EACH GROUP.
    *
    * With:
    *
    *   directAdvanceCount = 2
    *   wildcardPosition = 3
    *
    * a team must still be capable of finishing 3rd.
    *
    * If fewer than 3 teams are guaranteed to finish above
    * its maximum possible points, it can still reach 3rd.
    */

    if (
      wildcardCount > 0 &&
      wildcardPosition > directAdvanceCount
    ) {
      const canReachWildcardPosition =
        teamsGuaranteedAboveMaximum <
        wildcardPosition;

      if (canReachWildcardPosition) {
        return "wildcard";
      }
    }

    /*
    * =========================================================
    * 6. ELIMINATED
    * =========================================================
    *
    * Cannot reach a direct position and cannot reach the
    * wildcard position.
    */

    return "eliminated";
  }

}