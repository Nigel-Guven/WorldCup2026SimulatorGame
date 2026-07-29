export interface GroupTeamStanding {
  teamId: string;
  teamName: string;
  flagUrl: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  lastFiveGames : string;
}