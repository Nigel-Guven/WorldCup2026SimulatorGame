import type { MatchFixture } from '../../types/matchFixture';

interface MatchdayTabsProps {
  activeMatchday: number;
  onSelectMatchday: (matchday: number) => void;
  fixtures?: MatchFixture[];
  totalMatchdays?: number;
}

export function MatchdayTabs({
  activeMatchday,
  onSelectMatchday,
  fixtures = [],
  totalMatchdays,
}: MatchdayTabsProps) {
  // 1. Determine matchdays either from explicit count or by scanning unique fixture matchdays
  const matchdays = totalMatchdays
    ? Array.from({ length: totalMatchdays }, (_, i) => i + 1)
    : Array.from(new Set(fixtures.map((f) => f.matchday))).sort((a, b) => a - b);

  // Fallback if fixtures haven't loaded or are empty
  const availableMatchdays = matchdays.length > 0 ? matchdays : [1, 2, 3];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 overflow-x-auto scrollbar-none">
      {availableMatchdays.map((md) => {
        const isActive = activeMatchday === md;
        return (
          <button
            key={md}
            onClick={() => onSelectMatchday(md)}
            className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-bold transition-all uppercase tracking-wider text-center ${
              isActive
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            MD {md}
          </button>
        );
      })}
    </div>
  );
}