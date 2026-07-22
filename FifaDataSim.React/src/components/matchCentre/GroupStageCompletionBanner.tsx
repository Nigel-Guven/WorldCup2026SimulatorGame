interface GroupStageCompletionBannerProps {
  onNavigateToKnockout: () => void;
}

export function GroupStageCompletionBanner({
  onNavigateToKnockout,
}: GroupStageCompletionBannerProps) {
  return (
    <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between">
      <div>
        <h3 className="text-md font-extrabold text-emerald-400 uppercase tracking-wide">
          Group Stage Concluded!
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          All 36 group fixtures are finished. Top 2 per group + 8 best 3rd place teams qualify.
        </p>
      </div>
      <button
        onClick={onNavigateToKnockout}
        className="mt-3 sm:mt-0 w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3 px-6 rounded-lg uppercase tracking-wider shadow-lg transition-transform active:scale-95 animate-bounce flex items-center justify-center space-x-2"
      >
        <span>Proceed to Knockout Bracket</span>
        <span>➔</span>
      </button>
    </div>
  );
}