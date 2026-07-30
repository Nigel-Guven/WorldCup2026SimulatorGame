namespace WorldCupSimulator.Models;

public class CrossGroupTeamStats
{
    public required Country Team { get; init; }
    public required string OriginalGroupId { get; init; }
    public int OriginalRankInGroup { get; init; }
    public int Points { get; init; }
    public int GoalDifference { get; init; }
    public int GoalsScored { get; init; }
    public int Wins { get; init; }
    public int SeedOrFifaRank { get; init; }
    public int YellowCards { get; init; } = 0;
    public int RedCards { get; init; } = 0;
}