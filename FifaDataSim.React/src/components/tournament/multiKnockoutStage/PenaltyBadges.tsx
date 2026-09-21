import React from 'react';

/**
 * Supports either:
 * - A string like "RGGGR" or "RGGGG"
 * - An array like ['R', 'G', 'G', 'G', 'R']
 * - A single total string/number (fallback display)
 */
interface PenaltyBadgesProps {
  penalties: string | string[] | number | null | undefined;
}

export function PenaltyBadges({ penalties }: PenaltyBadgesProps) {
  if (penalties === null || penalties === undefined) return null;

  // Convert input to array if string (e.g., "RGGGR" -> ["R", "G", "G", "G", "R"])
  const sequence: string[] = Array.isArray(penalties)
    ? penalties
    : typeof penalties === 'string' && /^[RG]+$/i.test(penalties)
    ? penalties.toUpperCase().split('')
    : [];

  // Fallback if penalties is just a number (e.g. 4) instead of sequence string
  if (sequence.length === 0) {
    return (
      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">
        p{penalties}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-0.5 ml-1.5" title="Penalty Shootout">
      {sequence.map((res, idx) => {
        const isScore = res === 'G';
        return (
          <span
            key={idx}
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-extrabold text-white shadow-xs ${
              isScore ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          >
            {res}
          </span>
        );
      })}
    </div>
  );
}