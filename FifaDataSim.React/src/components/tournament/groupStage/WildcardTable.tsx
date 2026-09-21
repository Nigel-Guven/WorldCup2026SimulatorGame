import {
  GroupSimulationUtils,
  type Fixture,
} from "../../../services/helpers/groupSimulationUtils";

import { getTeamKey } from "../execution/draws/GroupStageDrawView";

export function WildcardTable({
  wildcardStandings,
  wildcardIndex,
  wildcardCount,
  standings,
  fixtures,
  directAdvanceCount,
  legs,
}: {
  wildcardStandings: any[];
  wildcardIndex: number;
  wildcardCount: number;
  standings: Record<string, any[]>;
  fixtures: Fixture[];
  directAdvanceCount: number;
  legs: number;
}) {
  return (
    <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-purple-100 pb-2 mb-3">
        <h5 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
          ⭐ Wildcard Ranking Table (Position #{wildcardIndex} across groups)
        </h5>

        <span className="text-[11px] text-purple-600 font-semibold">
          Top {wildcardCount} Advance
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-purple-100 text-purple-400 font-semibold uppercase text-[10px]">
              <th className="py-2 px-1 w-6">#</th>
              <th className="py-2 px-2">Team</th>
              <th className="py-2 px-1 text-center">Group</th>
              <th className="py-2 px-1 text-center">P</th>
              <th className="py-2 px-1 text-center">GD</th>
              <th className="py-2 px-1 text-center font-bold text-purple-900">
                Pts
              </th>
            </tr>
          </thead>

          <tbody>
            {wildcardStandings.map((row, idx) => {
              const rank = idx + 1;

              /*
               * The wildcard table does NOT determine whether a team
               * is eligible for the wildcard route.
               *
               * That was already determined by the GroupTable:
               *
               *   X = cannot directly qualify, but can reach the
               *       wildcard position in its group.
               *
               * We therefore retrieve the team's existing group
               * qualification status.
               */
              const groupStatus =
                GroupSimulationUtils.getTeamQualificationStatus(
                  row.team,
                  {
                    standings,
                    fixtures,
                  },
                  {
                    directAdvanceCount,
                    wildcardPosition: wildcardIndex,
                    wildcardCount,
                    legs,
                  }
                );

              /*
               * Only teams that are actually X in their group
               * should participate in the wildcard table.
               */
              const isWildcardTeam =
                groupStatus === "wildcard";

              /*
               * The wildcard ranking now determines the actual
               * outcome of the wildcard route.
               *
               * Top N = advance.
               * Everyone below N = eliminated.
               *
               * This is DIFFERENT from the group status:
               *
               *   Group:    X = wildcard route
               *   Wildcard: X + top N = wildcard advances
               */
              const wildcardAdvances =
                isWildcardTeam &&
                rank <= wildcardCount;

              const wildcardEliminated =
                isWildcardTeam &&
                rank > wildcardCount;

              /*
               * If the wildcard table is still in progress, keep
               * the X status rather than prematurely eliminating
               * teams.
               *
               * A completed wildcard table is detected when every
               * team represented in the table has completed its
               * relevant group.
               */
              const allWildcardGroupsComplete =
                wildcardStandings.every((wildcardRow) => {
                  const groupRows =
                    standings[wildcardRow.groupKey];

                  if (!groupRows) {
                    return false;
                  }

                  const teamKeys = new Set(
                    groupRows.map((groupRow) =>
                      getTeamKey(groupRow.team)
                    )
                  );

                  const groupFixtures =
                    fixtures.filter((fixture) => {
                      if (
                        !fixture.homeTeam ||
                        !fixture.awayTeam
                      ) {
                        return false;
                      }

                      return (
                        teamKeys.has(
                          getTeamKey(
                            fixture.homeTeam
                          )
                        ) &&
                        teamKeys.has(
                          getTeamKey(
                            fixture.awayTeam
                          )
                        )
                      );
                    });

                  return !groupFixtures.some(
                    (fixture) =>
                      !fixture.isPlayed
                  );
                });

              /*
               * Determine the visual state.
               */
              let indicatorColor =
                "bg-gray-300";

              let statusLabel = "";

              let rowStyle =
                "border-b border-purple-50 hover:bg-purple-50/20";

              if (wildcardAdvances) {
                /*
                 * Still X semantically, because this is a
                 * wildcard qualification rather than direct
                 * group qualification.
                 */
                indicatorColor =
                  "bg-purple-600";

                statusLabel = "X";

                rowStyle =
                  "border-b border-purple-100 bg-purple-100/80 text-purple-950 font-semibold";
              } else if (
                wildcardEliminated &&
                allWildcardGroupsComplete
              ) {
                indicatorColor =
                  "bg-red-500";

                statusLabel = "E";

                rowStyle =
                  "border-b border-red-100 bg-red-50/70 text-red-950 font-medium";
              } else if (isWildcardTeam) {
                /*
                 * Still alive in the wildcard competition.
                 *
                 * Do NOT turn them into E just because they are
                 * currently outside the top wildcardCount.
                 */
                indicatorColor =
                  "bg-purple-500";

                statusLabel = "X";

                rowStyle =
                  "border-b border-purple-50 hover:bg-purple-50/20";
              } else {
                /*
                 * This should normally not occur because the
                 * wildcardStandings should contain only the
                 * wildcard-position teams.
                 */
                indicatorColor =
                  "bg-gray-300";
              }

              return (
                <tr
                  key={
                    getTeamKey(row.team) ||
                    idx
                  }
                  className={rowStyle}
                >
                  <td className="py-2 px-1 font-bold">
                    {rank}
                  </td>

                  <td className="py-2 px-2 font-medium">
                    <div className="flex items-center gap-2">
                      {statusLabel ? (
                        <span
                          className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white ${indicatorColor}`}
                        >
                          {statusLabel}
                        </span>
                      ) : (
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${indicatorColor}`}
                        />
                      )}

                      {row.team.flag_url && (
                        <img
                          src={row.team.flag_url}
                          alt={`${row.team.name} flag`}
                          className="w-4 h-3 object-cover rounded-sm shrink-0 shadow-xs"
                        />
                      )}

                      <span className="truncate">
                        {row.team.name}
                        {row.team.isStarred == true && (
                          <span className="ml-1 text-sm" title="Starred Country">⭐</span>
                        )} 
                      </span>
                    </div>
                  </td>

                  <td className="py-2 px-1 text-center font-bold text-purple-700">
                    {row.groupKey}
                  </td>

                  <td className="py-2 px-1 text-center text-gray-500">
                    {row.played}
                  </td>

                  <td className="py-2 px-1 text-center text-gray-500">
                    {row.gd > 0
                      ? `+${row.gd}`
                      : row.gd}
                  </td>

                  <td className="py-2 px-1 text-center font-bold text-purple-950">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
