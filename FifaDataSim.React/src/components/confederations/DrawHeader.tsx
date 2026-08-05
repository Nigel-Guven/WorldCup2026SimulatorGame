interface DrawHeaderProps {
  title: string;
  subtitle: string;
  assignedCount: number;
  totalTeams: number;
  isComplete: boolean;
  confirmLabel: string;
  onDrawNext?: () => void;
  onAutoDraw: () => void;
  onReset: () => void;
  onConfirm: () => void;
}

export function DrawHeader({
  title,
  subtitle,
  assignedCount,
  totalTeams,
  isComplete,
  confirmLabel,
  onDrawNext,
  onAutoDraw,
  onReset,
  onConfirm,
}: DrawHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
      <div>
        <h3 className="font-bold text-gray-800 text-sm">
          {title}: {assignedCount} / {totalTeams} Teams Placed
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onDrawNext && (
          <button
            type="button"
            onClick={onDrawNext}
            disabled={isComplete}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            🎲 Draw Next Team
          </button>
        )}
        <button
          type="button"
          onClick={onAutoDraw}
          disabled={isComplete}
          className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          ⚡ Auto Draw All
        </button>
        <button
          type="button"
          onClick={onReset}
          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          ↺ Reset
        </button>
        {isComplete && (
          <button
            type="button"
            onClick={onConfirm}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer animate-pulse"
          >
            ✓ {confirmLabel}
          </button>
        )}
      </div>
    </div>
  );
}