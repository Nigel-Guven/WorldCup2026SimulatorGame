import type { GroupState } from '../../types/groupState';
import type { GroupTeamStanding } from '../../types/groupTeamStanding';

interface GroupStandingsTableProps {
  group: GroupState;
}

export function GroupStandingsTable({ group }: GroupStandingsTableProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="bg-slate-800/40 border-b border-slate-800 px-4 py-2.5 flex justify-between items-center">
        <h3 className="font-black text-sm tracking-wide text-white">
          GROUP {group.name}
        </h3>
      </div>
      <table className="w-full text-[11px] text-left border-collapse">
        <thead>
          <tr className="bg-slate-950 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800">
            <th className="py-2 px-3 w-8 text-center">#</th>
            <th className="py-2 px-2">Team</th>
            <th className="py-2 px-1 text-center w-8">P</th>
            <th className="py-2 px-1 text-center w-8">GD</th>
            <th className="py-2 px-2 text-right w-10">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40 font-medium">
          {group.standings.map((row: GroupTeamStanding, idx: number) => (
            <tr key={row.teamId} className="hover:bg-slate-800/20 transition-colors">
              <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded text-[10px] ${
                    idx < 2
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                      : 'text-slate-600'
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
                    className="w-4 h-2.5 object-cover rounded shadow-xs"
                  />
                  <span className="font-semibold truncate max-w-[100px]">
                    {row.teamName}
                  </span>
                </div>
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
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="py-2.5 px-2 text-right font-mono font-bold text-white bg-slate-950/20">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}