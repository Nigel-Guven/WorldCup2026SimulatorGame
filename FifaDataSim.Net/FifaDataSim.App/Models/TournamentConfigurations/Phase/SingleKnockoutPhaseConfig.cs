using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Models.TournamentConfigurations.Phase;

public class SingleKnockoutPhaseConfig : TournamentPhaseConfig
{
    public PhaseType Phase => PhaseType.SingleBranchKnockoutStage;
    public int StartingTeamsCount { get; init; }
    public List<BracketSlotConfig>? BracketSlots { get; init; } = [];
    public CombinationMatrixConfig? ThirdPlaceMatrix { get; init; }
    public bool HasTwoLegs { get; init; }
    public bool HasThirdPlacePlayoff { get; init; }
}