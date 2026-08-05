import type { Country } from "../../types/country";

export const DrawUtils = {
  /** Generates path or group key letters: 0 -> "A", 1 -> "B", etc. */
  getGroupKey(index: number): string {
    return String.fromCharCode(65 + index);
  },

  /** Distributes array of items round-robin across N buckets */
  roundRobinDistribute(teams: Country[], bucketCount: number): Record<string, Country[]> {
    const buckets: Record<string, Country[]> = {};
    for (let i = 0; i < bucketCount; i++) {
      buckets[this.getGroupKey(i)] = [];
    }

    teams.forEach((team, index) => {
      const key = this.getGroupKey(index % bucketCount);
      buckets[key]?.push(team);
    });

    return buckets;
  },

  /** Pairs seeded (Pot 1) vs unseeded (Pot 2) teams for single-branch knockouts */
  pairSeededKnockout(pot1: Country[], pot2: Country[], matchCount: number) {
    return Array.from({ length: matchCount }, (_, i) => ({
      matchId: i + 1,
      teamA: pot1[i] || null,
      teamB: pot2[i] || null,
    }));
  },

  shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
};