using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Models.TournamentConfigurations.Phase;

public class MultiKnockoutPhaseConfig: TournamentPhaseConfig
{
    public PhaseType Phase => PhaseType.MultiBranchKnockoutStage;
    public int NumberOfPaths { get; init; }
    public int TeamsPerPath { get;  init; }
    public bool HasTwoLegs { get;  init; }
}