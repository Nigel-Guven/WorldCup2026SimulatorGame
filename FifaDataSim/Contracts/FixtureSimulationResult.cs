using WorldCupSimulator.Models;

namespace WorldCupSimulator.Contracts;

public class FixtureSimulationResult
{
    public Guid FixtureId { get; init; }
    public string PhaseId { get; init; }
    public Country HomeTeam { get; init; } = null!;
    public Country AwayTeam { get; init; } = null!;
    public int HomeScore { get; init; }
    public int AwayScore { get; init; }
    public int? HomePenaltyScore { get; init; }
    public int? AwayPenaltyScore { get; init; }
    public Country? Winner { get; init; }
    public bool IsPlayed { get; init; }
    public bool IsPhaseCompleted { get; init; }
}