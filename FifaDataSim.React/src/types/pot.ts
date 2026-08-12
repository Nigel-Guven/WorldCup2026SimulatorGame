import type { Country } from "./country";

export interface Pot {
  id: number;
  name: string;
  teams: Country[];
}
