namespace WorldCupSimulator.Models;

public class TournamentSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<GroupState> Groups { get; set; } = [];
    public List<MatchFixture> Fixtures { get; set; } = [];
    public bool IsGroupStageCompleted { get; set; }
    public KnockoutBracket? KnockoutBracket { get; set; }
}