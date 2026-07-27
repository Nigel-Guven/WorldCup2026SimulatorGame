import type { Country } from "../types/country";

export interface TournamentDrawSetupDto {
  tournamentCode: string;
  tournamentName: string;
  totalTeams: number;
  numberOfGroups: number;
  numberOfTeamsPerGroup: number;
  maxTwoUefaPerGroup: boolean;
  pots: Country[][];
}