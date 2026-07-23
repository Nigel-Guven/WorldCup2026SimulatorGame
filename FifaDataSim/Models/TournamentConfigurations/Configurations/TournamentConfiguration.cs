using WorldCupSimulator.Models.Countries;

namespace WorldCupSimulator.Models.TournamentConfigurations;

public class TournamentConfiguration
{
    public required string Code { get; init; }            
    public required string Name { get; init; }
    public required int TotalTeams { get; init; }
    public required Dictionary<Confederation, int>? ConfederationSlots { get; init; }
    public required PotConfiguration Pots { get; init; }
    public required GroupStageConfiguration GroupStage { get; init; }
    public required KnockoutStageConfiguration KnockoutStage { get; init; }
}