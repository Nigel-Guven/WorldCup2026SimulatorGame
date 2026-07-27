using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Models.TournamentConfigurations;

public class GroupStageConfiguration
{
    public required int NumberOfGroups { get; init; }     
    public required int TeamsPerGroup { get; init; } 
    public required int AutomaticQualifiersPerGroup { get; init; } 
    public required MatchmakingType Matchmaking { get; init; } 
    public ThirdPlaceQualificationConfiguration? NthPlaceRule { get; init; }
}