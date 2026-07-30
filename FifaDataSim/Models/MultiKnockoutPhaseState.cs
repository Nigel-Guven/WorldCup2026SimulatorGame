namespace WorldCupSimulator.Models;

public class MultiKnockoutPhaseState : PhaseState
{
    public List<KnockoutPath> Paths { get; set; } = [];
}