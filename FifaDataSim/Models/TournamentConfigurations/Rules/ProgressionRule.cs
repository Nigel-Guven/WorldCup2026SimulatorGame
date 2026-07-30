namespace WorldCupSimulator.Models.TournamentConfigurations.Rules;

public class ProgressionRule
{
    public int StartRank { get; init; } 
    public int EndRank { get; init; }   
    public string TargetPhaseId { get; init; } 
}