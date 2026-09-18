import { GroupSimulationUtils, type Fixture } from "../../../services/helpers/groupSimulationUtils";
import { getTeamKey } from "../execution/draws/GroupStageDrawView";

export function WildcardTable({
  wildcardStandings,
  wildcardIndex,
  wildcardCount,
  standings,
  fixtures,
  directAdvanceCount,
}: {
  wildcardStandings: any[];
  wildcardIndex: number;
  wildcardCount: number;
  standings: Record<string, any[]>;
  fixtures: Fixture[];
  directAdvanceCount: number;
}) {
  return (
    <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-purple-100 pb-2 mb-3">
        <h5 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
          ⭐ Wildcard Ranking Table (Position #{wildcardIndex} across groups)
        </h5>
        <span className="text-[11px] text-purple-600 font-semibold">Top {wildcardCount} Advance</span>
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
              <th className="py-2 px-1 text-center font-bold text-purple-900">Pts</th>
            </tr>
          </thead>
          <tbody>
            {wildcardStandings.map((row, idx) => {
              const rank = idx + 1;
              const isWildcardPole = rank <= wildcardCount;
              const status = GroupSimulationUtils.getTeamQualificationStatus(
                row.team,
                { standings, fixtures },
                { directAdvanceCount, wildcardPosition: wildcardIndex, wildcardCount }
              );

              let indicatorColor = 'bg-gray-300';
              if (status === 'qualified') indicatorColor = 'bg-emerald-500';
              else if (status === 'wildcard') indicatorColor = 'bg-purple-500';
              else if (status === 'eliminated') indicatorColor = 'bg-red-500';

              return (
                <tr
                  key={getTeamKey(row.team) || idx}
                  className={`border-b border-purple-50 ${
                    isWildcardPole ? 'bg-purple-100/70 text-purple-950 font-semibold' : 'hover:bg-purple-50/20'
                  }`}
                >
                  <td className="py-2 px-1 font-bold">{rank}</td>
                  <td className="py-2 px-2 font-medium">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${indicatorColor}`} />
                      {row.team.flag_url && (
                        <img
                          src={row.team.flag_url}
                          alt={`${row.team.name} flag`}
                          className="w-4 h-3 object-cover rounded-sm shrink-0 shadow-xs"
                        />
                      )}
                      <span className="truncate">{row.team.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-1 text-center font-bold text-purple-700">{row.groupKey}</td>
                  <td className="py-2 px-1 text-center text-gray-500">{row.played}</td>
                  <td className="py-2 px-1 text-center text-gray-500">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  <td className="py-2 px-1 text-center font-bold text-purple-950">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}