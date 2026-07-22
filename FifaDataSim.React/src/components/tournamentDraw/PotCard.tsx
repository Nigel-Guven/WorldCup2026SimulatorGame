import type { Country } from "../../types/country";

interface PotCardProps {
  potNumber: number;
  teams: Country[];
  isActive: boolean;
}

export function PotCard({ potNumber, teams, isActive }: PotCardProps) {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm ${
        isActive ? 'ring-2 ring-emerald-500' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1.5">
        <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
          Pot {potNumber}
        </h3>
        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
          {teams.length} left
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto text-xs">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex items-center space-x-2 bg-slate-950/40 px-2 py-1.5 rounded border border-slate-800/40"
          >
            <img src={team.flag_url} alt="" className="w-5 h-3.5 object-cover rounded" />
            <span className="truncate text-slate-300 font-medium">{team.name}</span>
          </div>
        ))}
        {teams.length === 0 && (
          <p className="text-slate-500 italic text-center py-2">All teams allocated</p>
        )}
      </div>
    </div>
  );
}