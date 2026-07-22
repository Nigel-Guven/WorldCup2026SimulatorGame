import type { KnockoutMatch } from "../../types/knockoutMatch";

export function getDisplayScore(
  isPlayed: boolean,
  isHome: boolean,
  match: KnockoutMatch
): string {
  if (!isPlayed) return '-';

  const extraScore = isHome ? match.homeExtraTimeScore : match.awayExtraTimeScore;
  const standardScore = isHome ? match.homeScore : match.awayScore;

  // If extra time was played and extra score exists, use it as the final 120-min score
  if (match.wentToExtraTime && extraScore !== null && extraScore !== undefined) {
    return String(extraScore);
  }

  return standardScore !== null && standardScore !== undefined
    ? String(standardScore)
    : '-';
}