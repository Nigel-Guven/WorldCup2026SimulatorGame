import type { Country } from "../../types/country";
import type { KnockoutMatchup } from "../../types/knockoutMatchup";

export const DrawUtils = {

  getGroupKey(index: number): string {
    let result = '';
    let temp = index;
    
    while (temp >= 0) {
        result = String.fromCharCode(65 + (temp % 26)) + result;
        temp = Math.floor(temp / 26) - 1;
    }
    
    return result; 
  },

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

  pairSeededKnockout(
    pot1: Country[],
    pot2: Country[],
    matchCount: number
  ): KnockoutMatchup[] {
    return Array.from({ length: matchCount }, (_, i) => ({
      id: `match-${i + 1}`,
      matchId: String(i + 1),
      teamA: pot1[i] ?? null,
      teamB: pot2[i] ?? null,
    })) as KnockoutMatchup[];
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