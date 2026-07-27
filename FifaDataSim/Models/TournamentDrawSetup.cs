namespace WorldCupSimulator.Models;

public class TournamentDrawSetup
{
    public required string TournamentCode { get; init; }
    public required string TournamentName { get; init; }
    public required int TotalTeams { get; init; }
    public required List<List<Country>> Pots { get; init; }
}