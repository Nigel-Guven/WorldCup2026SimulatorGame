import type { Country } from "../../types/country";
import RankBadge from "./RankingBadge";

interface RankingRowProps {
  team: Country;
  rank: number;
}

// Helper component to render FIFA-style star ratings (0.5 min to 5.0 max, scaled to 93 ceiling)
function StarRating({ score }: { score: number }) {
  const maxStars = 5;
  const maxScoreCeiling = 90; // Calibrated so top nations like Spain (93) achieve 5 full stars

  // Convert score to 5-star scale, rounded to nearest 0.5, clamped between 0.5 and 5.0
  const rawRating = Math.round((score / maxScoreCeiling) * maxStars * 2) / 2;
  const ratingOutOfFive = Math.min(maxStars, Math.max(0.5, rawRating));

  return (
    <div
      className="flex items-center gap-1.5"
      title={`Overall Rating: ${score}/100 (${ratingOutOfFive} ★)`}
    >
      <div className="flex text-amber-400">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starNumber = index + 1;
          const isFull = starNumber <= ratingOutOfFive;
          const isHalf = starNumber - 0.5 === ratingOutOfFive;

          return (
            <span key={index} className="relative text-base">
              {/* Background empty star */}
              <span className="text-slate-700">★</span>

              {/* Overlay for full or half filled star */}
              {(isFull || isHalf) && (
                <span
                  className={`absolute left-0 top-0 overflow-hidden text-amber-400 ${
                    isHalf ? "w-[50%]" : "w-full"
                  }`}
                >
                  ★
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className="font-mono text-xs text-slate-400">({score})</span>
    </div>
  );
}

export default function RankingRow({ team, rank }: RankingRowProps) {
  // Calculate average of attack and defence strengths (1-100 scale)
  const averageStrength = Math.round((team.strength_attack + team.strength_defence) / 2);

  return (
    <tr className="group transition-colors hover:bg-slate-800/30">
      {/* Rank */}
      <td className="px-6 py-4 text-center font-bold">
        <RankBadge rank={rank} />
      </td>

      {/* Team Info (Flag, Name, Association, Stadium) */}
      <td className="px-6 py-4 font-medium text-white">
        <div className="flex items-center space-x-4">
          <img
            src={team.flag_url}
            alt={`${team.name} flag`}
            className="h-8 w-12 rounded bg-slate-800 object-cover shadow-sm"
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

      {/* Confederation */}
      <td className="px-6 py-4 text-center">
        <span className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-300">
          {team.confederation}
        </span>
      </td>

      {/* FIFA Ranking Points */}
      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">
        {team.default_points}
      </td>

      {/* Combined Attack/Defence Star Rating */}
      <td className="px-6 py-4 text-right">
        <div className="inline-flex justify-end">
          <StarRating score={averageStrength} />
        </div>
      </td>

      {/* Individual Attack Rating */}
      <td className="px-6 py-4 text-right font-mono text-slate-400">
        {team.strength_attack}%
      </td>

      {/* Individual Defence Rating */}
      <td className="px-6 py-4 text-right font-mono text-slate-400">
        {team.strength_defence}%
      </td>

      {/* Home Advantage */}
      <td className="px-6 py-4 text-right font-mono text-slate-400">
        {team.home_advantage}%
      </td>
    </tr>
  );
}