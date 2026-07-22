import type { Country } from "./country";

export interface KnockoutMatch {
  id: string;
  stage: 'R32' | 'R16' | 'QF' | 'SF' | 'ThirdPlace' | 'Final';
  matchNumber: number;
  homeTeam: Country | null;
  awayTeam: Country | null;
  homeScore: number | null;
  awayScore: number | null;
  wentToExtraTime: boolean;
  homeExtraTimeScore: number | null;
  awayExtraTimeScore: number | null;
  wentToPenalties: boolean;
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
  winner: Country | null;
  isPlayed: boolean;
}