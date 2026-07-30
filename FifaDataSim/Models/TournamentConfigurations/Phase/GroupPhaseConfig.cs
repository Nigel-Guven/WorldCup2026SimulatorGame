using WorldCupSimulator.Models.TournamentConfigurations.Enums;
using WorldCupSimulator.Models.TournamentConfigurations.Rules;

namespace WorldCupSimulator.Models.TournamentConfigurations.Phase;

public class GroupPhaseConfig : TournamentPhaseConfig
{
    public PhaseType Phase => PhaseType.GroupStage;
    public int NumberOfGroups { get; init; }
    public int TeamsPerGroup { get; init; }
    public bool IsRoundRobin { get; init; }
    public bool LimitConfederationTeamsPerGroup { get; init; }
    public List<ProgressionRule> DirectProgressionRules { get; init; } = [];
    public List<CrossGroupProgressionRule> CrossGroupProgressionRules { get; init; } = [];
}