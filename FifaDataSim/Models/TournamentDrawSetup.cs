namespace WorldCupSimulator.Models;

public class TournamentDrawSetup
{
    public required string TournamentCode { get; init; }
    public required string TournamentName { get; init; }
    public required int TotalTeams { get; init; }
    public int NumberOfGroups { get; set; }
    public int NumberOfTeamsPerGroup { get; set; }
    public bool MaxTwoUefaPerGroup { get; set; }
    public required List<List<Country>> Pots { get; init; }
}