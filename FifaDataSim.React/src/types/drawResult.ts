import type { Country } from "./country";
import type { KnockoutMatchup } from "./knockoutMatchup";

// In drawResult.ts
export type DrawResult =
  | { type: 'GROUP'; groups: Record<string, Country[]> }
  | { type: 'SINGLE_KNOCKOUT'; matchups: KnockoutMatchup[] }
  | { type: 'MULTI_KNOCKOUT'; pathAssignments: Record<string, KnockoutMatchup[]> };