import type { Country } from "./country";
import type { KnockoutMatchup } from "./knockoutMatchup";

export interface PathState {
  pathKey: string;
  matches: KnockoutMatchup[];
  isComplete: boolean;
  champion: Country | null;
  runnerUp: Country | null;
  thirdPlace?: Country | null;
}