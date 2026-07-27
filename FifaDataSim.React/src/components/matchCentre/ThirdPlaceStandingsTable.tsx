import { useMemo } from 'react';
import type { GroupState } from '../../types/groupState';

interface ThirdPlaceStandingsTableProps {
  groups: GroupState[];
  totalFixtures: number;
  nthPlacePositionQualifier: number;
  nthPlacePositionCandidates: number;
}

type QualificationStatus = 'Q' | 'E' | null;

export function ThirdPlaceStandingsTable({
  groups,
  totalFixtures,
  nthPlacePositionQualifier,
  nthPlacePositionCandidates
}: ThirdPlaceStandingsTableProps) {

  const thirdPlaceRankings = useMemo(() => {
    const thirdPlaceTeams = groups
      .map((group) => {
        // Index 2 = 3rd place
        const row = group.standings[nthPlacePositionQualifier];

        if (!row) return null;

        return {
          ...row,
          groupName: group.name,
        };
      })
      .filter(Boolean);

    return thirdPlaceTeams.sort((a, b) => {
      if (b!.points !== a!.points) {
        return b!.points - a!.points;
      }

      if (b!.goalDifference !== a!.goalDifference) {
        return b!.goalDifference - a!.goalDifference;
      }

      return (b!.goalsFor ?? 0) - (a!.goalsFor ?? 0);
    });
  }, [groups]);


  const getQualificationStatus = (
    teamIdx: number
  ): QualificationStatus => {

    const team = thirdPlaceRankings[teamIdx];

    if (!team) return null;

    const remainingFixtures =
      totalFixtures - team.played;

    const maxPossiblePoints =
      team.points + remainingFixtures * 3;


    const cutoffTeam =
      thirdPlaceRankings[nthPlacePositionQualifier - 1];


    if (!cutoffTeam) return null;


    /*
      Guaranteed Qualification

      If this team is currently inside
      the qualifying positions and the next
      team cannot catch them.
    */
    if (teamIdx < nthPlacePositionQualifier) {

      const firstNonQualifier =
        thirdPlaceRankings[nthPlacePositionQualifier];


      if (!firstNonQualifier) {
        return 'Q';
      }


      const firstNonQualifierMaxPoints =
        firstNonQualifier.points +
        (totalFixtures - firstNonQualifier.played) * 3;


      if (team.points > firstNonQualifierMaxPoints) {
        return 'Q';
      }
    }


    /*
      Mathematical Elimination

      If this team cannot reach the
      current cutoff team's points.
    */
    if (teamIdx >= nthPlacePositionQualifier) {
      const isFinished = remainingFixtures === 0;

      // 1. Points impossible to reach
      if (maxPossiblePoints < cutoffTeam.points) {
        return 'E';
      }

      // 2. Finished tied on points, but cutoff team beats them on tiebreakers
      if (isFinished && maxPossiblePoints === cutoffTeam.points) {
        // Cutoff team has better GD
        if (cutoffTeam.goalDifference > team.goalDifference) {
          return 'E';
        }
        // Equal GD, but cutoff team has better Goals For
        if (
          cutoffTeam.goalDifference === team.goalDifference &&
          (cutoffTeam.goalsFor ?? 0) > (team.goalsFor ?? 0)
        ) {
          return 'E';
        }
      }
    }


    return null;
  };


  if (thirdPlaceRankings.length === 0) {
    return null;
  }


  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">

      <div className="bg-slate-800/60 border-b border-slate-800 px-4 py-3 flex justify-between items-center">

        <div>
          <h3 className="font-black text-sm tracking-wide text-amber-400 uppercase">
            3rd Place Ranking Tracker
          </h3>

          <p className="text-[11px] text-slate-400">
            Top {nthPlacePositionCandidates} third-place teams qualify for the Knockout Stage.
          </p>
        </div>


        <span className="text-xs font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60 px-2.5 py-1 rounded-full">
          Cross-Group Standings
        </span>

      </div>


      <table className="w-full text-[11px] text-left border-collapse">

        <thead>
          <tr className="bg-slate-950 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800">

            <th className="py-2.5 px-3 text-center w-10">
              #
            </th>

            <th className="py-2.5 px-2">
              Team
            </th>

            <th className="py-2.5 px-2 text-center w-12">
              Grp
            </th>

            <th className="py-2.5 px-1 text-center w-10">
              P
            </th>

            <th className="py-2.5 px-1 text-center w-10">
              GD
            </th>

            <th className="py-2.5 px-2 text-right w-12">
              Pts
            </th>

            <th className="py-2.5 px-2 text-center w-10">
              Status
            </th>

          </tr>
        </thead>


        <tbody className="divide-y divide-slate-800/40 font-medium">

          {thirdPlaceRankings.map((row, idx) => {

            if (!row) return null;


            const status = getQualificationStatus(idx);

            const isQualifying =
              idx < nthPlacePositionCandidates;


            return (

              <tr
                key={row.teamId}
                className={`transition-colors ${
                  isQualifying
                    ? 'hover:bg-emerald-950/20'
                    : 'hover:bg-slate-800/20 opacity-70'
                }`}
              >

                <td className="py-2.5 px-3 text-center font-bold">

                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-mono ${
                      isQualifying
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-black'
                        : 'bg-slate-950 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </span>

                </td>


                <td className="py-2.5 px-2 text-slate-200">

                  <div className="flex items-center space-x-2">

                    <img
                      src={row.flagUrl}
                      alt=""
                      className="w-4 h-2.5 object-cover rounded shadow-xs shrink-0"
                    />

                    <span className="font-semibold truncate max-w-[120px]">
                      {row.teamName}
                    </span>

                  </div>

                </td>


                <td className="py-2.5 px-2 text-center">

                  <span className="text-[10px] font-mono font-bold bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                    {row.groupName}
                  </span>

                </td>


                <td className="py-2.5 px-1 text-center font-mono text-slate-400">
                  {row.played}
                </td>


                <td
                  className={`py-2.5 px-1 text-center font-mono ${
                    row.goalDifference > 0
                      ? 'text-emerald-500'
                      : row.goalDifference < 0
                      ? 'text-red-400'
                      : 'text-slate-500'
                  }`}
                >

                  {row.goalDifference > 0
                    ? `+${row.goalDifference}`
                    : row.goalDifference}

                </td>


                <td className="py-2.5 px-2 text-right font-mono font-bold text-white bg-slate-950/20">
                  {row.points}
                </td>
                <td className="py-2.5 px-2 text-center font-black">
                  {status === 'Q' && (
                    <span className="text-emerald-400">
                      Q
                    </span>
                  )}

                  {status === 'E' && (
                    <span className="text-red-400">
                      E
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}