using WorldCupSimulator.Models.TournamentConfigurations.Enums;
using WorldCupSimulator.Models.TournamentConfigurations.Rules;

namespace WorldCupSimulator.Models.TournamentConfigurations.Phase;

public abstract class TournamentPhaseConfig
{
    public Confederation Confederation { get; init; }
    public string PhaseId { get; init; }
    public string PhaseName { get; init; }
    public int Order { get; init; }
    public PhaseType PhaseType { get; init;  }
    public List<ProgressionRule> ProgressionRules { get; init; } = [];
}