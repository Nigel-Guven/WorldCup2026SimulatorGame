namespace WorldCupSimulator.Models.TournamentConfigurations.Rules;

public class ProgressionRule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SourcePhaseId { get; set; }
    public int FromRank { get; init; } 
    public int ToRank { get; init; }   
    public Guid DestinationTournamentId { get; set; }
    public Guid? DestinationPhaseId { get; set; }
    public string RuleDescription { get; set; } = string.Empty;
}