import type { GroupState } from '../../types/groupState';
import type { GroupTeamStanding } from '../../types/groupTeamStanding';

interface GroupStandingsTableProps {
  group: GroupState;
}

type QualificationStatus = 'Q' | 'E' | null;

export function GroupStandingsTable({ group }: GroupStandingsTableProps) {
  const TOTAL_GROUP_MATCHES = 3;
  const POINTS_PER_WIN = 3;

  const getStatus = (teamIdx: number): QualificationStatus => {
    const standings = group.standings;
    if (!standings || standings.length === 0) return null;

    const totalTeams = standings.length;
    const matchesPerTeam = totalTeams - 1; // e.g. 9 matches for a 10-team group
    const qualifyingSpots = 2; // Top 2 advance

    // If group has fewer teams than qualification spots, qualification logic doesn't apply
    if (totalTeams <= qualifyingSpots) return null;

    const currentTeam = standings[teamIdx];
    const teamMaxPoints = currentTeam.points + (matchesPerTeam - currentTeam.played) * 3;

    // 1. Check for Guaranteed Qualification ('Q')
    // For teams currently inside qualifying spots (e.g. index 0 or 1)
    if (teamIdx < qualifyingSpots) {
      // The first team outside qualification (e.g. index 2 for 3rd place)
      const firstOutTeam = standings[qualifyingSpots]; 
      const firstOutMaxPoints = firstOutTeam.points + (matchesPerTeam - firstOutTeam.played) * 3;

      // If 3rd place cannot catch up to current team's existing points even by winning all remaining games
      if (currentTeam.points > firstOutMaxPoints) {
        return 'Q';
      }
    }

    // 2. Check for Mathematical Elimination ('E')
    // For teams currently outside qualifying spots (e.g. index >= 2)
    if (teamIdx >= qualifyingSpots) {
      // The team currently holding the last qualifying spot (e.g. index 1 for 2nd place)
      const lastQualifyingTeam = standings[qualifyingSpots - 1];

      // If current team's max possible points cannot reach 2nd place's current points
      if (teamMaxPoints < lastQualifyingTeam.points) {
        return 'E';
      }
    }

    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="bg-slate-800/40 border-b border-slate-800 px-4 py-2.5 flex justify-between items-center">
        <h3 className="font-black text-sm tracking-wide text-white">
          GROUP {group.name}
        </h3>
        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Qualified</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
            <span>Eliminated</span>
          </span>
        </div>
      </div>

      <table className="w-full text-[11px] text-left border-collapse">
        <thead>
          <tr className="bg-slate-950 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800">
            <th className="py-2 px-3 w-8 text-center">#</th>
            <th className="py-2 px-2">Team</th>
            <th className="py-2 px-1 text-center w-8">P</th>
            <th className="py-2 px-1 text-center w-8">GD</th>
            <th className="py-2 px-2 text-right w-12">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40 font-medium">
          {group.standings.map((row: GroupTeamStanding, idx: number) => {
            const status = getStatus(idx);

            // Row highlighting & position badge styling
            let posBadgeStyle = 'text-slate-600 bg-slate-950/40';
            let rowBgStyle = 'hover:bg-slate-800/20';

            if (status === 'Q') {
              posBadgeStyle = 'bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-bold';
              rowBgStyle = 'bg-emerald-950/10 hover:bg-emerald-950/20';
            } else if (status === 'E') {
              posBadgeStyle = 'bg-rose-950/60 text-rose-400 border border-rose-800/50 font-bold';
              rowBgStyle = 'bg-rose-950/10 hover:bg-rose-950/20';
            } else if (idx < 2) {
              posBadgeStyle = 'bg-slate-800 text-slate-300';
            }

            return (
              <tr key={row.teamId} className={`transition-colors ${rowBgStyle}`}>
                {/* Position + Qualification Badge */}
                <td className="py-2.5 px-3 text-center font-bold">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] ${posBadgeStyle}`}>
                    {idx + 1}
                  </span>
                </td>

                {/* Team Name + Flag + Status Tag */}
                <td className="py-2.5 px-2 text-slate-200">
                  <div className="flex items-center justify-between pr-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <img
                        src={row.flagUrl}
                        alt=""
                        className="w-4 h-2.5 object-cover rounded shadow-xs shrink-0"
                      />
                      <span className="font-semibold truncate max-w-[100px]">
                        {row.teamName}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {status === 'Q' && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-tight">
                        Q
                      </span>
                    )}
                    {status === 'E' && (
                      <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30 uppercase tracking-tight">
                        E
                      </span>
                    )}
                  </div>
                </td>

                {/* Played */}
                <td className="py-2.5 px-1 text-center font-mono text-slate-400">
                  {row.played}
                </td>

                {/* Goal Difference */}
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

                {/* Points */}
                <td className="py-2.5 px-2 text-right font-mono font-bold text-white bg-slate-950/20">
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}