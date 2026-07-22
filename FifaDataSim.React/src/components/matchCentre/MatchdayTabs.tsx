interface MatchdayTabsProps {
  activeMatchday: number;
  matchdays?: number[];
  onSelectMatchday: (matchday: number) => void;
}

export function MatchdayTabs({
  activeMatchday,
  matchdays = [1, 2, 3],
  onSelectMatchday,
}: MatchdayTabsProps) {
  return (
    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
      {matchdays.map((md) => (
        <button
          key={md}
          onClick={() => onSelectMatchday(md)}
          className={`flex-1 text-center py-2 text-sm font-bold rounded-md transition-all ${
            activeMatchday === md
              ? 'bg-slate-800 text-emerald-400 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Matchday {md}
        </button>
      ))}
    </div>
  );
}