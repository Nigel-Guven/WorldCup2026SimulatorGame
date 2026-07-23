using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Models.TournamentConfigurations;

public class PotConfiguration
{
    public required int TotalPots { get; init; }
    public required PotSortingType SortingType { get; init; }
    public bool HostInPotOne { get; init; } = true; 
    
    public DrawConstraintsConfiguration? DrawConstraints { get; init; }
}