import type { Country } from "../../types/country";
import RankBadge from "./RankingBadge";

interface RankingRowProps {
  team: Country;
  rank: number;
}

export default function RankingRow({ team, rank }: RankingRowProps) {
  return (
    <tr className="group transition-colors hover:bg-slate-800/30">
      <td className="px-6 py-4 text-center font-bold">
        <RankBadge rank={rank} />
      </td>

      <td className="px-6 py-4 font-medium text-white">
        <div className="flex items-center space-x-3">
          <img
            src={team.flag_url}
            alt={`${team.name} flag`}
            className="h-4 w-6 rounded bg-slate-800 object-cover shadow-sm"
          />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{team.name}</span>
              <span className="font-mono text-xs text-slate-400">
                ({team.short_name})
              </span>
            </div>
            <div className="text-xs font-normal text-green-500 transition-colors group-hover:text-slate-400">
              {team.football_association}
            </div>
            <div className="text-xs font-normal text-amber-400 transition-colors group-hover:text-slate-400">
              {team.home_stadium}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <span className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-300">
          {team.confederation}
        </span>
      </td>

      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">
        {team.default_points.toLocaleString()}
      </td>

      <td className="px-6 py-4 text-right font-mono text-slate-400">
        {team.strength}%
      </td>
    </tr>
  );
}