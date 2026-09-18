import { GroupSimulationUtils, type Fixture } from "../../../services/helpers/groupSimulationUtils";

const getTeamKey = (team?: any): string => team?.id ?? team?.name ?? '';

export function GroupTable({
  groupKey,
  rows,
  standings,
  fixtures,
  directAdvanceCount,
  wildcardIndex,
  wildcardCount,
}: {
  groupKey: string;
  rows: any[];
  standings: Record<string, any[]>;
  fixtures: Fixture[];
  directAdvanceCount: number;
  wildcardIndex: number;
  wildcardCount: number;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
        <h5 className="font-bold text-gray-800 text-sm">Group {groupKey}</h5>
        <span className="text-[11px] text-gray-400">Top {directAdvanceCount} Direct Advance</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
              <th className="py-2 px-1 w-6">#</th>
              <th className="py-2 px-2">Team</th>
              <th className="py-2 px-1 text-center">P</th>
              <th className="py-2 px-1 text-center">W</th>
              <th className="py-2 px-1 text-center">D</th>
              <th className="py-2 px-1 text-center">L</th>
              <th className="py-2 px-1 text-center">GD</th>
              <th className="py-2 px-1 text-center font-bold text-gray-700">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const rank = idx + 1;
              const status = GroupSimulationUtils.getTeamQualificationStatus(
                row.team,
                { standings, fixtures },
                { directAdvanceCount, wildcardPosition: wildcardIndex, wildcardCount }
              );

              let rowStyle = 'hover:bg-gray-50/50';
              let indicatorColor = 'bg-gray-300';

              if (status === 'qualified') {
                rowStyle = 'bg-emerald-50/60 text-emerald-950 font-medium';
                indicatorColor = 'bg-emerald-500';
              } else if (status === 'wildcard') {
                rowStyle = 'bg-purple-50/60 text-purple-950 font-medium';
                indicatorColor = 'bg-purple-500';
              } else if (status === 'eliminated') {
                rowStyle = 'bg-red-50/60 text-red-950 font-medium';
                indicatorColor = 'bg-red-500';
              }

              return (
                <tr key={getTeamKey(row.team) || idx} className={`border-b border-gray-100/60 ${rowStyle}`}>
                  <td className="py-2 px-1 font-bold text-[11px]">{rank}</td>
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
                  <td className="py-2 px-1 text-center text-gray-500">{row.played}</td>
                  <td className="py-2 px-1 text-center text-gray-500">{row.won}</td>
                  <td className="py-2 px-1 text-center text-gray-500">{row.drawn}</td>
                  <td className="py-2 px-1 text-center text-gray-500">{row.lost}</td>
                  <td className="py-2 px-1 text-center text-gray-500">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  <td className="py-2 px-1 text-center font-bold text-gray-900">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}