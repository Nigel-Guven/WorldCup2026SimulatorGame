import type { KnockoutBracket } from "../../types/KnockoutBracket";


interface ChampionBannerProps {
  champion: KnockoutBracket['champion'];
}

export function ChampionBanner({ champion }: ChampionBannerProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">
          Knockout Stage
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Single-elimination tree from Round of 32 down to the World Cup Final.
        </p>
      </div>

      {champion && (
        <div className="mt-4 md:mt-0 bg-emerald-950 border border-emerald-500 px-6 py-3 rounded-xl flex items-center space-x-4 shadow-2xl animate-bounce">
          <span className="text-3xl">🏆</span>
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
              World Cup Champion
            </span>
            <div className="flex items-center space-x-2">
              <img
                src={champion.flag_url}
                alt=""
                className="w-6 h-4 object-cover rounded"
              />
              <span className="text-xl font-black text-white">{champion.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}