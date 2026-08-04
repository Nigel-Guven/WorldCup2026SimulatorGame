import type { Country } from "./country";

export interface MatchFixture {
  id: string;
  phaseId: string;
  groupName: string;
  matchDay: number;
  homeTeam: Country;
  awayTeam: Country;
  homeScore: number | null;
  awayScore: number | null;
  wentToExtraTime: boolean;
  homeExtraTimeScore: number | null;
  awayExtraTimeScore: number | null;
  wentToPenalties: boolean;
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
  isPlayed: boolean;
}