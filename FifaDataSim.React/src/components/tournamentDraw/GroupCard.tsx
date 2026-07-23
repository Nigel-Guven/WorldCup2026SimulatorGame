import type { Group } from "../../hooks/useTournamentDraw";
import type { Country } from "../../types/country";

interface GroupCardProps {
  group: Group;
  totalPots?: number; // Pass totalPots from useTournamentDraw (defaults to 4 if not provided)
}

export function GroupCard({ group, totalPots = 4 }: GroupCardProps) {
  // Max teams per group corresponds directly to the total number of pots in the tournament
  const maxTeamsPerGroup = totalPots;
  const emptySlotsCount = Math.max(0, maxTeamsPerGroup - group.teams.length);

  return (
    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 min-h-48 flex flex-col justify-between">
      <div>
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 rounded-t-lg -mx-4 -mt-4 mb-3 flex justify-between items-center">
          <span className="font-black text-slate-200">GROUP {group.name}</span>
          <span className="text-[10px] font-mono text-slate-500">
            {group.teams.length}/{maxTeamsPerGroup}
          </span>
        </div>
        <div className="space-y-2">
          {group.teams.map((team: Country, idx: number) => (
            <div
              key={team.id}
              className="flex items-center justify-between bg-slate-900/60 border border-slate-800/50 rounded-lg p-2 group"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="text-xs font-mono font-bold text-slate-600 w-3">
                  {idx + 1}
                </span>
                <img
                  src={team.flag_url}
                  alt=""
                  className="w-5 h-3.5 object-cover rounded"
                />
                <span className="text-sm font-semibold text-white truncate">
                  {team.name}
                </span>
              </div>
              <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-400">
                {team.default_points}
              </span>
            </div>
          ))}

          {Array.from({ length: emptySlotsCount }).map((_, idx) => (
            <div
              key={idx}
              className="border border-dashed border-slate-800/60 rounded-lg py-3 text-center text-xs text-slate-700 font-mono italic"
            >
              Slot {group.teams.length + idx + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}