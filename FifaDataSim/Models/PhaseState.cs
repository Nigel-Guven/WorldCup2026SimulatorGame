namespace WorldCupSimulator.Models;

public abstract class PhaseState
{
    public string PhaseId { get; init; }
    public string PhaseName { get; init; }
    public PhaseStatus Status { get; set; } = PhaseStatus.Pending;
    public List<Country> ParticipatingTeams { get; set; } = [];
    public List<MatchFixture> Fixtures { get; set; } = [];
    public bool IsComplete { get; set; }
}