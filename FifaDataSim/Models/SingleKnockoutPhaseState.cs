namespace WorldCupSimulator.Models;

public class SingleKnockoutPhaseState : PhaseState
{
    public List<MatchFixture> Matches { get; set; } = [];
}