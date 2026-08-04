namespace WorldCupSimulator.Models.TournamentConfigurations.Phase;

public class BracketSlotConfig
{
    public string SlotId { get; init; } // e.g., "R16_MATCH_1"
    public string HomeTeamSource { get; init; } // e.g., "WINNER_GROUP_B"
    public string AwayTeamSource { get; init; } // e.g., "THIRD_PLACE_SLOT_1"
}