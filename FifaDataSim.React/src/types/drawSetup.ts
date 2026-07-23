import type { Country } from "../types/country";

export interface TournamentDrawSetupDto {
  tournamentCode: string;
  tournamentName: string;
  totalTeams: number;
  pots: Country[][];
}