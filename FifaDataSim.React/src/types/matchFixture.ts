import type { Country } from "./country";

export interface MatchFixture {
  id: string;
  groupName: string;
  matchday: number;
  homeTeam: Country;
  awayTeam: Country;
  homeScore: number | null;
  awayScore: number | null;
  isPlayed: boolean;
}