namespace WorldCupSimulator.Models;

public class TournamentSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public List<GroupState> Groups { get; set; } = [];
    public List<MatchFixture> Fixtures { get; set; } = [];
    public required int NthPlaceQualificationPosition { get; set; }
    public required int NthPlaceNumberOfCandidates { get; set; }
    public KnockoutBracket? KnockoutBracket { get; set; }
}