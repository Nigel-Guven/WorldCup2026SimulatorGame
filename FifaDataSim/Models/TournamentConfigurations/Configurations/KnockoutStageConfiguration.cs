using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Models.TournamentConfigurations;

public class KnockoutStageConfiguration
{
    public required KnockoutRound StartingRound { get; init; } // R32, R16, QF, etc.
    public bool HasThirdPlaceMatch { get; init; } = true;
    public ExtraTimeRule ExtraTimeRule { get; init; } = ExtraTimeRule.StandardExtraTimeAndPenalties;
}