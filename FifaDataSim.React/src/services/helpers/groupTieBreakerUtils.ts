import type { GroupStandingEntry } from './types';
import { calculateFairPlayScore } from './calculateFairPlayScore';

/**
 * Sort comparator for group standings and best third-place wildcard rankings.
 * Returns negative if Team A is ranked higher than Team B.
 */
export function compareGroupEntries(
  a: GroupStandingEntry,
  b: GroupStandingEntry,
  isSameGroup: boolean = false
): number {
  // 1. Overall Points
  if (b.points !== a.points) {
    return b.points - a.points;
  }

  // Head-to-Head Tiebreakers (Only applicable between teams from the exact same group)
  if (isSameGroup && a.headToHead && b.headToHead) {
    const h2hA = a.headToHead[b.team.id];
    const h2hB = b.headToHead[a.team.id];

    if (h2hA && h2hB) {
      // 2. Head-to-Head Points
      if (h2hA.points !== h2hB.points) {
        return h2hB.points - h2hA.points;
      }

      // 3. Head-to-Head Goal Difference
      if (h2hA.goalDifference !== h2hB.goalDifference) {
        return h2hB.goalDifference - h2hA.goalDifference;
      }

      // 4. Head-to-Head Goals Scored
      if (h2hA.goalsFor !== h2hB.goalsFor) {
        return h2hB.goalsFor - h2hA.goalsFor;
      }
    }
  }

  // 5. Overall Goal Difference
  if (b.goalDifference !== a.goalDifference) {
    return b.goalDifference - a.goalDifference;
  }

  // 6. Overall Goals Scored
  if (b.goalsFor !== a.goalsFor) {
    return b.goalsFor - a.goalsFor;
  }

  // 7. Disciplinary / Fair Play Points (Higher score is better)
  const fairPlayA = calculateFairPlayScore(a.disciplinary);
  const fairPlayB = calculateFairPlayScore(b.disciplinary);
  if (fairPlayB !== fairPlayA) {
    return fairPlayB - fairPlayA;
  }

  // 8. Fallback: Alphabetical or deterministic ID sorting
  return a.team.name.localeCompare(b.team.name);
}