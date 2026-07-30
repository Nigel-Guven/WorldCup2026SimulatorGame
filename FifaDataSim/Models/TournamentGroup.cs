namespace WorldCupSimulator.Models;

public class TournamentGroup
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public List<GroupTeamStanding> Standings { get; set; } = [];
}