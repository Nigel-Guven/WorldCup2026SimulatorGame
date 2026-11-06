
import type { JSX } from 'react';
import type { QualificationResult, SwissSimulationUtils } from '../../../services/helpers/swissLeagueSimulationUtils';

type SwissStanding = ReturnType<
  typeof SwissSimulationUtils.computeStandings
>[number];

interface SwissLeagueStandingsTableProps {
  standings: SwissStanding[];
  qualificationResults: QualificationResult[];
  directAdvanceCount: number;
  playoffStartPosition: number;
  playoffTeamsCount: number;
}

export function SwissLeagueStandingsTable({
  standings,
  qualificationResults,
  directAdvanceCount,
  playoffStartPosition,
  playoffTeamsCount,
}: SwissLeagueStandingsTableProps): JSX.Element {

    const qualificationMap = new Map(
        qualificationResults.map(result => [
            result.teamId,
            result
        ])
    );



  return (
    <div className="lg:col-span-9 space-y-4">
      <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">
        Overall League Standings
      </h4>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 text-gray-600 uppercase">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-2 text-center">P</th>
                <th className="py-3 px-2 text-center">W</th>
                <th className="py-3 px-2 text-center">D</th>
                <th className="py-3 px-2 text-center">L</th>
                <th className="py-3 px-2 text-center">GF</th>
                <th className="py-3 px-2 text-center">GA</th>
                <th className="py-3 px-2 text-center">GD</th>
                <th className="py-3 px-3 text-center font-bold">Pts</th>
                <th className="py-3 px-4 text-center">Form</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {standings.map((row) => {

                const qualification = qualificationMap.get(
                    String(row.team.id)
                );

                const qualificationStatus = qualification?.status;

                const isDirectAdvance = row.rank <= directAdvanceCount;

                const isPlayoff =
                  row.rank >= playoffStartPosition &&
                  row.rank < playoffStartPosition + playoffTeamsCount;

                return (
                  <tr
                    key={row.team.id}
                    className={`hover:bg-gray-50/80 transition-colors ${
                      isDirectAdvance
                        ? 'bg-emerald-50/40'
                        : isPlayoff
                          ? 'bg-blue-50/30'
                          : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 text-center font-bold text-gray-700">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          isDirectAdvance
                            ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                            : isPlayoff
                              ? 'bg-blue-100 text-blue-800 font-extrabold'
                              : 'text-gray-600'
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                        {qualificationStatus && (
                            <span
                                title={
                                    qualificationStatus === 'Q'
                                        ? 'Guaranteed direct qualification'
                                        : qualificationStatus === 'X'
                                            ? 'Still eligible for qualification or playoffs'
                                            : 'Mathematically eliminated'
                                }
                                className={`inline-flex items-center justify-center
                                    w-6 h-6 rounded-md font-extrabold text-xs
                                    ${
                                        qualificationStatus === 'Q'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : qualificationStatus === 'X'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {qualificationStatus}
                            </span>
                        )}
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        {row.team.flag_url && (
                          <img
                            src={row.team.flag_url}
                            alt=""
                            className="w-5 h-3.5 object-cover rounded shadow-xs"
                          />
                        )}

                        <span>{row.team.name}</span>

                        {row.team.isStarred && (
                          <span title="Starred Country">⭐</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-2 text-center text-gray-600">
                      {row.played}
                    </td>

                    <td className="py-2.5 px-2 text-center text-gray-600">
                      {row.won}
                    </td>

                    <td className="py-2.5 px-2 text-center text-gray-600">
                      {row.drawn}
                    </td>

                    <td className="py-2.5 px-2 text-center text-gray-600">
                      {row.lost}
                    </td>

                    <td className="py-2.5 px-2 text-center text-gray-600">
                      {row.goalsFor}
                    </td>

                    <td className="py-2.5 px-2 text-center text-gray-600">
                      {row.goalsAgainst}
                    </td>

                    <td className="py-2.5 px-2 text-center font-medium text-gray-700">
                      {row.goalDifference > 0
                        ? `+${row.goalDifference}`
                        : row.goalDifference}
                    </td>

                    <td className="py-2.5 px-3 text-center font-extrabold text-gray-900 text-sm">
                      {row.points}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <span className="font-mono tracking-wider font-bold text-[11px] text-gray-500">
                        {row.team.form ?? ''}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
