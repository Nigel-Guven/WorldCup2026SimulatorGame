import type { Country } from "./country";
import type { KnockoutMatch } from "./knockoutMatch";

export interface KnockoutBracket {
  roundOf32: KnockoutMatch[];
  roundOf16: KnockoutMatch[];
  quarterFinals: KnockoutMatch[];
  semiFinals: KnockoutMatch[];
  thirdPlaceMatch: KnockoutMatch;
  final: KnockoutMatch;
  champion: Country | null;
}