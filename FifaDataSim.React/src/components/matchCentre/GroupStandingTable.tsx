import type { GroupState } from '../../types/groupState';
import type { GroupTeamStanding } from '../../types/groupTeamStanding';

interface GroupStandingsTableProps {
  group: GroupState;
  totalFixtures: number;
}

type QualificationStatus = 'Q' | 'E' | null;

export function GroupStandingsTable({ group, totalFixtures }: GroupStandingsTableProps) {

  const getQualificationStatus = (teamIdx: number): QualificationStatus => {
    const standings = group.standings;

    if (!standings || standings.length === 0) return null;

    const qualifyingSpots = 2;

    if (standings.length <= qualifyingSpots) return null;

    const currentTeam = standings[teamIdx];

    const remainingFixtures = totalFixtures - currentTeam.played;
    const teamMaxPoints = currentTeam.points + remainingFixtures * 3;

    // Guaranteed Qualification
    if (teamIdx < qualifyingSpots) {
      const firstTeamOutsideQualification = standings[qualifyingSpots];

      const outsideRemainingFixtures =
        totalFixtures - firstTeamOutsideQualification.played;

      const outsideMaxPoints =
        firstTeamOutsideQualification.points + outsideRemainingFixtures * 3;

      // Current team already has more points than the best possible result
      // of the first team outside qualification
      if (currentTeam.points > outsideMaxPoints) {
        return 'Q';
      }
    }

    // Mathematically Eliminated
    if (teamIdx >= qualifyingSpots) {
      const lastQualifyingTeam = standings[qualifyingSpots - 1];

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
            <th className="py-2 px-1 text-center w-8">Last 5 Games</th>
            <th className="py-2 px-1 text-center w-8">P</th>
            <th className="py-2 px-1 text-center w-8">W</th>
            <th className="py-2 px-1 text-center w-8">D</th>
            <th className="py-2 px-1 text-center w-8">L</th>
            <th className="py-2 px-1 text-center w-8">GD</th>
            <th className="py-2 px-2 text-right w-12">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40 font-medium">
          {group.standings.map((row: GroupTeamStanding, idx: number) => {
            const status = getQualificationStatus(idx);

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

                {/* Last 5 Games */}
                <td className="py-2.5 px-1 text-center font-mono">
                  <div className="flex items-center justify-center space-x-0.5 text-[11px]">
                    {row.lastFiveGames?.split('').map((result, i) => {
                      let icon = '➖';
                      if (result === 'W') icon = '✅';
                      if (result === 'L') icon = '❌';

                      return (
                        <span key={i} title={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}>
                          {icon}
                        </span>
                      );
                    })}
                  </div>
                </td>

                {/* Played */}
                <td className="py-2.5 px-1 text-center font-mono text-slate-400">
                  {row.played}
                </td>

                {/* Won */}
                <td className="py-2.5 px-1 text-center font-mono text-slate-400">
                  {row.won}
                </td>

                {/* Drawn */}
                <td className="py-2.5 px-1 text-center font-mono text-slate-400">
                  {row.drawn}
                </td>

                {/* Lost */}
                <td className="py-2.5 px-1 text-center font-mono text-slate-400">
                  {row.lost}
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