// types/knockoutMatchup.ts
import type { Country } from './country';

export interface KnockoutMatchup {
  id: string;
  matchId: string;
  roundIndex: number;
  matchIndex?: number;
  roundName?: string;
  teamA: Country | null;
  teamB: Country | null;
  winner?: Country | null;
  loser?: Country | null;
  isPlayed: boolean;
  isThirdPlaceMatch?: boolean;
  
  leg1ScoreA?: number | null;
  leg1ScoreB?: number | null;
  leg2ScoreA?: number | null;
  leg2ScoreB?: number | null;
  penaltiesA?: number | null;
  penaltiesB?: number | null;
}