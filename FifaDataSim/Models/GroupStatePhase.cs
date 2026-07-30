namespace WorldCupSimulator.Models;

public class GroupPhaseState : PhaseState
{
    public List<TournamentGroup> Groups { get; set; } = []; 
}