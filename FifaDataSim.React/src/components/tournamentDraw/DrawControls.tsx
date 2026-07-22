interface DrawControlsProps {
  currentPotIndex: number;
  isDrawComplete: boolean;
  onDrawNext: () => void;
  onAutoDraw: () => void;
}

export function DrawControls({
  currentPotIndex,
  isDrawComplete,
  onDrawNext,
  onAutoDraw,
}: DrawControlsProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      <h1 className="text-2xl font-black text-white tracking-tight uppercase">
        World Cup Draw
      </h1>
      <p className="text-xs text-slate-400 mt-1 mb-4">
        48 Qualified Teams partitioned by Seeding Points.
      </p>

      <div className="space-y-2">
        <button
          onClick={onDrawNext}
          disabled={isDrawComplete}
          className={`w-full py-3 px-4 font-bold rounded-lg shadow transition-all duration-200 uppercase tracking-wider text-sm ${
            isDrawComplete
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 transform active:scale-98'
          }`}
        >
          {isDrawComplete ? 'Draw Concluded' : `Draw Team (Pot ${currentPotIndex})`}
        </button>

        {!isDrawComplete && (
          <button
            onClick={onAutoDraw}
            className="w-full py-2 px-4 font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs uppercase tracking-wider transition-colors"
          >
            ⚡ Auto-Complete Draw
          </button>
        )}
      </div>
    </div>
  );
}